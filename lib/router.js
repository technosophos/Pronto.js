var util = require('util');
var events = require('events');
var Context = require('./context');
var Registry = require('./registry');
var logging = require('./logging');

module.exports = Router;

/**
 * The application router.
 *
 * This takes a route (in any supported format) and resolves
 * it to a particular chain of commands.
 */
function Router(registry) {
  this.registry = registry;
  this.resolver = null;
  this.loggers = [];
  this.logEmitter = new logging.Logger;
  this.attachLoggers();
}

// Router generates events.
util.inherits(Router, events.EventEmitter);

/*
 * Set a new registry.
 * 
 * Use with caution.
 */
Router.prototype.setRegistry = function(registry) {
  this.registry = registry;

  // Re-attach loggers.
  this.detachLoggers();
  this.attachLoggers();
}

/**
 * Attach all logging backends to the router.
 */
Router.prototype.attachLoggers = function() {
  var logBackends = this.registry.getLoggers();
  for (var i = 0; i < logBackends.length; ++i) {
    var l = logBackends[i];
    var LogImpl = l.logger;
    var impl = new LogImpl(this.logEmitter, l.options);
    this.loggers.push(impl);
  }
}
/**
 * This destroys the loggers.
 */
Router.prototype.detachLoggers = function() {
  for (var i = 0; i < this.loggers.length; ++i) {
    delete this.loggers[i];
  }
}

/**
 * Take the given request name and resolve it to a 
 * real request name.
 */
Router.prototype.resolveRequest = function(requestName, context) {
  
  if (this.resolver != null) {
    //console.log('RESOLVING ' + this.resolver.resolve(requestName));
    return this.resolver.resolve(requestName, context);
  }
  
  // Return just the request name for now.
  return requestName;
}

Router.prototype.setRequestResolver = function(resolver) {
  this.resolver = resolver;
}

/**
 * Given a request, perform the associated commands.
 *
 * Emits:
 * - error: Given an Error object. Emitted when request cannot be found, or when any part of the request fails.
 * - commandsStart:  Given request spec and context. Emitted immediately before the chain is run.
 * - commandsLaunched: Trigger immediately after a chain is kicked off. This may fire before the first command is complete.
 * - commandListComplete: Emitted when the entire chain has been executed.
 * - commandContinue: Emitted when the command is "done enough" for processing to continue. The next 
 *    command will start upon seeing this.
 * - commandComplete: Emitted when a command is totally complete. This may happen after other commands have begun
 *    executing.
 * - beforeCommand: A command emits this before it executes.
 * - beforeCommandInit: A command emits this before it runs its init() routine.
 * - commandListInterrupted
 * - reroute
 *
 * @param string request
 * @param pronto.Context cxt (optional)
 */
Router.prototype.handleRequest = function(request, cxt, tainted) {
  request = this.resolveRequest(request, cxt);
  
  var spec = this.registry.getRequestSpec(request);
  if (spec == undefined || spec == null) {
    var err = new Error('Request not found');
    this.emit('error', err, cxt);
    return;
  }
  
  if (!!tainted && request.length > 0 && request[0] == '@') {
    throw new Error('A tainted route cannot call an internal @-method.');
  }

  // BEGIN NEW
  //this.doCommand(request, spec);
  var context = cxt;
  if (cxt instanceof Context) {
    // Do we re-intialize loggers?
  }
  else {
    context = new Context();
    context.setLogger(this.logEmitter);
  }
  this.emit('commandsStart', spec, context);

  // doCommand is recursive.
  this.doCommand(request, spec, context, 0);

  this.emit('commandsLaunched', context);
}

/**
 * Execute the current command and then request that the next be executed.
 *
 * This executes the current command (`spec[index]`), and then 
 * requests (if necessary) that the next command be executed.
 *
 * Stopping conditions:
 * The command processing stops under the following conditions:
 *  - There are no more commands to execute
 *  - An unhandle `Error` is thrown or emitted.
 *  - A `stop` event is received from the command, or manually triggered.
 *  - A `reroute` event is received from the command. In this case, the
 *    present list is aborted, and the new route is run.
 *
 *
 */
Router.prototype.doCommand = function(requestName, spec, context, index) {

  // Stopping conditions.
  if (index >= spec.length) {
    this.emit('commandListComplete', context);
    return;
  }
  else if (this.stop) {
    this.emit('commandListInterrupted', requestName, spec, context);
    
    // EXPERIMENTAL: When we stop, we really want to "finish" the
    // request, so we slice the spec and send it in again to complete
    // the "normal" process.
    var fakeSpec = spec.slice(0, index);
    this.stop = false;
    this.doCommand(requestName, fakeSpec, context, ++index);
    return;
  }
  //console.log('Running ' + spec[index].name);
  
  // No stopping conditions were met, so we build and execute the command.
  
  item = spec[index];
  var cmd = this.constructCommand(item);
  
  // emit beforeCommandInit
  cmd.init(item.name);
  
  var params = this.buildParams(item, context);  
  var router = this;
  
  // Emit 'commandContinue'
  cmd.on('continue', function () {
    router.emit('commandContinue', item, context);
    // Recurse.
    router.doCommand(requestName, spec, context, ++index);
  });
  
  // Emit 'commandComplete'
  cmd.on('complete', function () { router.emit('commandComplete', spec, context)});
  // Catch a request to stop processing.
  cmd.on('stop', function () {
    router.emit('commandListInterrupted', requestName, spec, context);
    router.stop = true;
  });
  // Catch a request to reroute
  cmd.on('reroute', function (routeName, newCxt) {
    router.emit('reroute', routeName, newCxt);
    router.handleRequest(routeName, newCxt);
  });
  
  cmd.on('error', function (err) {
    // Bubble the event.
    router.emit('error', err, context);
    router.stop = true;
  })
  
  // Execute.
  this.emit('beforeCommand', cmd, context, params, spec);
  cmd.executionWrapper(context, params);
}

/**
 * Given a spec, create a new instance of a command.
 *
 * This should be done as late as possible to reduce
 * the amount of memory overhead on un-executed
 * commands.
 */
Router.prototype.constructCommand = function(spec) {
  var cmd = spec.command;
  if (cmd == undefined) {
    throw new Error("No command defined for " + spec.name);
  }
  else if(typeof cmd == 'string') {
    cmd = require(cmd);
  }
  return new cmd();
}

/**
 * Check whether the given request name exists.
 */
Router.prototype.hasRequest = function(requestName) {
  return this.registry.getRequestSpec(requestName) != undefined;
}


// FIXME:
Router.prototype.buildParams = function(spec, cxt) {
  // TODO: Insert from() resolution.
  params = {};
  for (var key in spec.params) {
    if (spec.params[key].from == undefined) {
      params[key] = spec.params[key].value;
    }
    else {
      var from = this.resolveFromSpec(spec.params[key].from, cxt);
      params[key] = from || spec.params[key].value;
    }
    
  }
  return params;
}

Router.prototype.resolveFromSpec = function(fromStr, cxt) {
  var retval;
  fromStr.split(' ').forEach(function(v, i) {
    // We want to split the pair string into an origin (cxt, get, header, etc.)
    // and the value.
    var firstColon = v.indexOf(':');
    var origin = v.substring(0, firstColon).toLowerCase();//source[0].toLowerCase();
    var key = v.substring(firstColon + 1);
    switch (origin) {
      case 'context':
      case 'cxt':
      case 'c':
        retval = cxt.get(key);
        return;
      case 'arg':
        // Support index or slice.
        break;
        
      // Proxy all others through cxt.getDatasource
      default:
        var ds = cxt.getDatasource(origin);
        if (ds != undefined) {
          retval = ds[key];
          return;
        }
    }
  });
  return retval;
}
