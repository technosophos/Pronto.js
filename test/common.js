util = require('util');
pronto = require('../lib/pronto');
exports.TestCommand = TestCommand;
exports.FailingCommand = FailingCommand;
exports.LogCommand = LogCommand;
exports.ErrorThrowingCommand = ErrorThrowingCommand;
exports.DumpStack = DumpStack;
exports.ReRoute = ReRoute;
exports.Stop = Stop;

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
	//this.store('ok');
	this.done('ok');
}

function FailingCommand() {}
util.inherits(FailingCommand, pronto.Command);
FailingCommand.prototype.execute = function(cxt, params) {
	this.emit('error', new Error('I feel sick.'));
}

function ErrorThrowingCommand() {}
pronto.inheritsCommand(ErrorThrowingCommand);
ErrorThrowingCommand.prototype.execute = function(cxt, params) {
	throw new Error('Throw me');
}

function LogCommand() {}
util.inherits(LogCommand, pronto.Command);
LogCommand.prototype.execute = function(cxt, params) {
	var msg = params.msg || 'LogCommand executed.';
	var level = params.level || 'debug';
	
	cxt.log(msg, level);
	
	this.done(msg);
}

function DumpStack(){}
pronto.inheritsCommand(DumpStack);
DumpStack.prototype.execute = function (cxt, params) {
  console.log(this.name);
  e = new Error('ds');
  console.log(e.stack);
  this.done();
}

function ReRoute(){}
pronto.inheritsCommand(ReRoute);
ReRoute.prototype.execute = function (cxt, params) {
  var routeTo = params.routeTo || '/test';
  console.log('Rerouting to ' + routeTo);
  this.reroute(routeTo, cxt);
}

function Stop(){}
pronto.inheritsCommand(Stop);
Stop.prototype.execute = function (cxt, params) {
  console.log('Stopping');
  //this.emit('stop', cxt);
  this.stop(cxt);
}