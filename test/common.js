util = require('util');
pronto = require('../lib/pronto');
exports.TestCommand = TestCommand;
exports.FailingCommand = FailingCommand;
exports.LogCommand = LogCommand;


// FIXTURE: Simple test command.
function TestCommand() {
	
}
util.inherits(TestCommand, pronto.Command);

TestCommand.prototype.execute = function(cxt, params) {
	this.cxt = cxt;
	this.params = params;
	
	// Add params into context for testing later.
	//this.cxt.add(this.name + '-params', params);
	this.store(params, 'params');
	
	//this.cxt.add(this.name, 'ok');
	this.store('ok');
	
	this.done();
}

function FailingCommand() {}
util.inherits(FailingCommand, pronto.Command);
FailingCommand.prototype.execute = function(cxt, params) {
	this.emit('error', new Error('I feel sick.'));
}

function LogCommand() {}
util.inherits(LogCommand, pronto.Command);
LogCommand.prototype.execute = function(cxt, params) {
	var msg = params.msg || 'LogCommand executed.';
	var level = params.level || 'debug';
	
	cxt.log(msg, level);
	
	this.done();
}