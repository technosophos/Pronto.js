var util = require('util');
var pronto = require('../pronto'); // Normally, this is just require('presto')

// Now we can call this require('hello').Command
exports.Command = HelloCommand;


function HelloCommand() {
  // Initialization, happens before execution.
}

util.inherits(HelloCommand, pronto.Command);

/**
 * A command must implement execute().
 */
HelloCommand.prototype.execute = function(context, params) {
  console.log('Hello World');
  
  // Notify the runner that the next command can run.
  this.done();
}