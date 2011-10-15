events = require('events');
util = require('util');
//Context = require('./context');

module.exports = CommandList; 

/**
 * The CommandList prototype.
 *
 * A command queue holds a list of commands, which it gets from
 * Presto. It will execute these asynchronously, but in sequence.
 *
 * While a list isn't necessarily immutable, it is not designed
 * to be altered once created. This could lead to unpredictable
 * outcomes. Once the command list begins executing, the list
 * should be fixed.
 */
function CommandList(requestName, config) {
  this.requestName = requestName;
  this.position = 0;
  this.commands = config;
}
util.inherits(CommandList, events.EventEmitter);

/**
 * Run the entire queue.
 */
CommandList.prototype.run = function(context) {
  this.context = context;
  this.execCurrent();
}

CommandList.prototype.rewind = function() {
  this.position = 0;
}

// Iterate the position counter.
CommandList.prototype.next = function() {
  this.position++;
  return this.commands[this.position];
}

// Get the current queue item. (This doesn't pop yet.)
CommandList.prototype.current = function() {
  return this.commands[this.position];
}

// Find out if there are more in the queue
CommandList.prototype.hasNext = function() {
  return this.position + 1 < this.commands.length;
}

// execute the current command, and have it execute
// subsequent commands.
CommandList.prototype.execCurrent = function() {
  // Run the current command
  var cmdSpec = this.commands[this.position];
  var cxt = this.context;
  
  //var cmdObject = new cmdSpec.command();
  var cmdObject = this.constructCommand(cmdSpec);
/*  cmdObject.on('error', function(e) {
    console.log('Saw an e');
  })*/

  // Emits: beforeCommand before the command is initialized.
  this.emit('beforeCommandInit', cmdSpec, this.context);
  
  // Init the command.
  cmdObject.init(this.commands[this.position].name);
  
  
  // Wait for it to say it's done
  // When it says it's done, let the queue continue.
  // XXX: The problem with this is that whatever emits the event
  // then stays in scope and cannot be deallocated until the 
  // commandlist itself can be deallocated. This could be a 
  // problem if a chain was, say, several hundred commands
  // long, or if an inner one used a lot of memory.
  var cqueue = this;
  cmdObject.on('continue', function(data) {
    // Emit: commandContinue (spec, cxt) when command emits continue.
    cqueue.emit('commandContinue', cmdSpec, cxt);
    
    // XXX: Solution to the above problem: Instead of directly 
    // executing the command, can we emit and let the router
    // handle it?
    cqueue.emit('execNext', cxt);
    //cqueue.execNext(cxt);
  });

  // Emits: commandComplete each time a command says it is complete.
  cmdObject.on('complete', function() {cqueue.emit('commandComplete', cmdSpec, cxt)});

  this.emit('beforeCommand', cmdSpec, this.context, cmdObject);
  
  var params = this.buildParams(cmdSpec, cxt);

  // Execute the actual command.
  cmdObject.executionWrapper(this.context, params);
}

// Execute the next command on the queue.
CommandList.prototype.execNext = function(cxt) {
  if (this.hasNext()) {
    this.next();
    this.execCurrent();
  }
  else {
    this.emit('commandListComplete', this.context);
  }
}

CommandList.prototype.buildParams = function(spec, cxt) {
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

CommandList.prototype.resolveFromSpec = function(fromStr, cxt) {
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

CommandList.prototype.constructCommand = function(spec) {
  var cmd = spec.command;
  if (cmd == undefined) {
    throw new Error("No command defined for " + spec.name);
  }
  else if(typeof cmd == 'string') {
    //require.paths.unshift(__dirname);
    cmd = require(cmd);
    //require.paths.shift();
  }
  return new cmd();
}