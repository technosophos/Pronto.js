/**
 * Base command class for Presto.
 */

var events = require('events'),
  util = require('util');

module.exports = Command;

// Sample Command
function Command() {
  
}
util.inherits(Command, events.EventEmitter);

Command.prototype.init = function(name) {
	this.name = name;
}

/**
 * Override this to provide your command with a task.
 *
 * This is the entry point for a command. It is executed exactly
 * once. When it is at the point where it should return control
 * to the command processor, it should call this.done().
 *
 * Anything stored in the context will be accessible to subsequent 
 * commands in the chain.
 *
 *
 */
Command.prototype.execute = function(cxt, params) {
  this.done();
}

Command.prototype.executionWrapper = function(cxt, params) {
  try {
    this.execute(cxt, params);
  } catch (err) {
		// Event: error is given the Error object.
    this.emit('error', err);
  }
}

/**
 * Notify Presto that this command is done.
 * 
 * This will allow Presto to continue executing the chain of 
 * commands. Not that you can call done, and then continue processing, but
 * the execution order after calling done() is not insured. For example,
 * a logging command can call done() before inserting a message into the log.
 * That message may not be inserted into the log until the rest of the commands 
 * have completed (MAY be, not WILL be -- the order is determined by the node runtime).
 */
Command.prototype.done = function() {
  this.emit('continue');
}

