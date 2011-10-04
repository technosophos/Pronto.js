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
	return this;
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
  var cmdObject = new cmdSpec.command();
	var cxt = this.context;

	// Emits: beforeCommand before the command is initialized.
	this.emit('beforeCommandInit', cmdSpec, this.context);
	
	// Init the command.
	cmdObject.init(this.commands[this.position].name);
  
  // Wait for it to say it's done
  // When it says it's done, let the queue continue.
  // XXX: Is there a clever way to use V8's bind() for this?
  var cqueue = this;
  cmdObject.on('continue', function(data) {
		// Emit: commandContinue (spec, cxt) when command emits continue.
		cqueue.emit('commandContinue', cmdSpec, data);
		cqueue.execNext(data);
	});

	// Emits: commandComplete each time a command says it is complete.
  cmdObject.on('complete', function() {cqueue.emit(emit('commandComplete', cmdSpec, cxt))})

	this.emit('beforeCommand', cmdSpec, this.context, cmdObject);

  // Execute the actual command.
  cmdObject.execute(this.context, {id: 'cmd-' + this.position});
}

// Execute the next command on the queue.
CommandList.prototype.execNext = function(data) {
  if (this.hasNext()) {
    this.next();
    this.execCurrent();
  }
}