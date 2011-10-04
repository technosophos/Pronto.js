util = require('util');
pronto = require('../lib/pronto');
exports.TestCommand = TestCommand;


// FIXTURE: Simple test command.
function TestCommand() {
	
}
util.inherits(TestCommand, pronto.Command);

TestCommand.prototype.execute = function(cxt, params) {
	this.cxt = cxt;
	this.params = params;
	
	this.cxt.add(this.name, 'ok');
	
	this.done();
}