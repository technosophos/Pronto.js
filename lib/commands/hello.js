/**
 * This is an example command.
 *
 * You can follow the pattern here to build your own Pronto
 * commands.
 *
 */

// Normally, this is just require('pronto'). It's different
// here because this file is inside of Pronto's source code.
var pronto = require('../pronto');

// You could do it this way and then 
// call this require('hello').Command
//exports.Command = HelloCommand;

// I prefer this way:
module.exports = HelloCommand;

// You could then use this by doing:
// var Hello = require('hello');


function HelloCommand() {
  // Initialization, happens before execution.
}

// This makes HelloCommand a real command.
pronto.inheritsCommand(HelloCommand);
// The above is basically the same as:
// util.inherits(HelloCommand, pronto.Command);

/**
 * A command must implement execute().
 *
 * This is where you put all of your command logic. Whenever
 * a command is done, it MUST call one of the event methods.
 * Usually this is `this.done()`.
 */
HelloCommand.prototype.execute = function(context, params) {

  // Log this:
  context.log('Hello World', 'info');

  // Store the string Hello World in the context.
  this.store('Hello World');
  // The above is the same as context.add(this.name, 'Hello World!');

  // Notify the runner that the next command can run.
  this.done();
}
