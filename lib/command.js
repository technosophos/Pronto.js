var events = require('events');
var util = require('util');

module.exports = Command;

/**
 * Base command class for Presto.
 *
 * All commands should inherit from this command. It provides the following:
 * 
 * - Integration into the Pronto events system
 * - Basic flow control
 * - Error capturing
 */
function Command() {}
util.inherits(Command, events.EventEmitter);

/**
 * Initialize the command.
 *
 * When overriding, make sure you call the parent init(name) to
 * execute this.
 */
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

/**
 * Wraps calls to execute().
 *
 * The wrapper monitors execution of the command, emitting 
 * any necessary events. This offloads responsibility from
 * commands. (For example, a command does not need to 
 * manually emit 'continue' and 'complete'.)
 *
 * This function does the following:
 *
 * - Fires execCommand event before executing the command
 * - Executes the command's execute() method
 * - Catches any errors and emits them as 'error'
 * - Emits 'continue' if necessary
 * - Emits 'complete' when the command is done
 */
Command.prototype.executionWrapper = function(cxt, params) {
	this.hasContinued = false;
	this.emit('execCommand', cxt, params);
  try {
    this.execute(cxt, params);
  } catch (err) {
		// Event: error is given the Error object.
    this.emit('error', err);
  }
	
	// Event: complete fired when command is 100% done. Note that this may be well
	// after the command has 'continued'.
	this.done(cxt);
}

/**
 * Provided just in case you need to this.keepCalmAnd().carryOn();
 */
Command.prototype.keepCalmAnd = function () {
	return this;
} 

/**
 * Instruct the runner that it can continue on to the next command.
 *
 * However, the current command can continue performing operations,
 * though the order in which they are executed is indeterminent.
 *
 * This is useful for simulating background processing.
 */
Command.prototype.carryOn = function() {
	this.hasContinued = true;
	this.emit('continue');
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
Command.prototype.done = function(cxt) {
	
	if (!this.hasContinued) {
		this.hasContinued = true;
		this.emit('continue');
	}
	
	// Event: continue
  this.emit('complete', cxt);
}