
var util = require('util');
var events = require('events');

// Local requirements.
var Context = require('./context');
var CommandList = require('./commandlist');
var Command = require('./command');
var Registry = require('./registry');

exports.Context = Context;
exports.CommandList = CommandList;
exports.Command = Command;
exports.Router = Router;
exports.Registry = exports.register = Registry;

/**
 * The application router.
 *
 * This takes a route (in any supported format) and resolves
 * it to a particular chain of commands.
 */
function Router() {}

// Router generates events.
util.inherits(Router, events.EventEmitter);

/**
 * Take the given request name and resolve it to a 
 * real request name.
 */
Router.prototype.resolveRequest = function(requestName) {
  // Return just the request name for now.
  return requestName;
}

/**
 *
 *
 * Emits:
 * - error: Given an Error object. Emitted when request cannot be found, or when any part of the request fails.
 * - exec:  Given request spec and context. Emitted immediately before the chain is run.
 * - done: Emitted when the entire chain has been executed.
 */
Router.prototype.handleRequest = function(request) {
  var realRequest = this.resolveRequest(request);

	var spec = Registry.getRequestSpec(request);
  if (spec == undefined) {
    var err = new Error('Request not found');
		this.emit('error', err);
		return;
  }
  
  var queue = new CommandList(request, spec);

	// We want these events to be bubbled.
	this.forwardEvents(queue, ['commandContinue', 'commandComplete', 'beforeCommand', 'beforeCommandInit', 'error']);

	// XXX: Do we act like a repeater for the CommandList events?

  var context = new Context();

	// Event: exec gets the spec and the context.
	this.emit('exec', spec, context);
  queue.run(context, request);

	// Event: done gets the context.
	this.emit('done', context);
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