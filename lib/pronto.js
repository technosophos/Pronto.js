
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
util.inherits(Router, events.EventEmitter)

/**
 * Take the given request name and resolve it to a 
 * real request name.
 */
Router.prototype.resolveRequest = function(requestName) {
  // Return just the request name for now.
  return requestName;
}

Router.prototype.handleRequest = function(request) {
  var realRequest = this.resolveRequest(request);

	var spec = Registry.getRequestSpec(request);
  
  if (spec == undefined) {
    // throw what?
    console.log('no such request found');
    return;
  }
  
  var queue = new CommandList(spec);
  var context = new Context();

	// Event: exec gets the spec and the context.
	this.emit('exec', spec, context);
  queue.run(context, request);

	// Event: done gets the context.
	this.emit('done', context);
}