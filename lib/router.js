var util = require('util');
var events = require('events');

var CommandList = require('./commandlist');
var Context = require('./context');
var Registry = require('./registry');

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
}

/**
 * Take the given request name and resolve it to a 
 * real request name.
 */
Router.prototype.resolveRequest = function(requestName) {
	
	if (this.resolver != null) {
		//console.log('RESOLVING ' + this.resolver.resolve(requestName));
		return this.resolver.resolve(requestName);
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
 * - exec:  Given request spec and context. Emitted immediately before the chain is run.
 * - done: Emitted when the entire chain has been executed.
 * - commandContinue
 * - commandComplete
 * - beforeCommand
 * - beforeCommandInit
 *
 * @param string request
 * @param pronto.Context cxt (optional)
 */
Router.prototype.handleRequest = function(request, cxt) {
  var request = this.resolveRequest(request);

	var spec = this.registry.getRequestSpec(request);
  if (spec == undefined || spec == null) {
    var err = new Error('Request not found');
		this.emit('error', err, cxt);
		return;
  }

  var queue = new CommandList(request, spec);

	// We want these events to be bubbled.
	this.forwardEvents(queue, ['commandContinue', 'commandComplete', 'beforeCommand', 'beforeCommandInit', 'error']);

	// XXX: Do we act like a repeater for the CommandList events?

  var context = cxt instanceof Context ? cxt : new Context();

	// Event: exec gets the spec and the context.
	this.emit('exec', spec, context);
  queue.run(context, request);

	// Event: done gets the context.
	this.emit('done', context);
}

/**
 * Check whether the given request name exists.
 */
Router.prototype.hasRequest = function(requestName) {
	return this.registry.getRequestSpec(requestName) != undefined;
}

/**
 * Bubble events upward.
 *
 * This captures each `events` event emitted by `obj` and 
 * re-emits the event.
 */
Router.prototype.forwardEvents = function(obj, events) {
	var myself = this;
	for (var i = 0; i < events.length; ++i) {
		//console.log('Wiring events for ' + events[i]);
		
		// This is sane. No, really. We need to make sure that the 
		// eventName is set immediately on the callback. By the 
		// time the callback is executed, events[i] will be wrong.
		// So we use this trick to set it correctly right here.
		obj.on(events[i], (function(eventName) { 
			return function() {
				var args = [eventName];
				for (var j = 0; j < arguments.length; ++j) {
					args.push(arguments[j]);
				}
				//console.log('received ' + eventName);
				myself.emit.apply(myself, args);
			}
		})(events[i]))
	}
}