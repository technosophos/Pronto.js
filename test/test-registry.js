var common = require('./common');
var pronto = require('../lib/pronto.js');
var assert = require('assert');

var register = new pronto.Registry();

/*
var c = pronto.register.config;

// Register just a request. CANARY. Remove this, as it is testing an invalid state.
pronto.register.route('foo');
assert.ok(c.requests['foo'] != undefined, 'Request should have been created.');
*/

// Register one command
register.route('bar').does(common.TestCommand, 'test-command');
assert.ok(register.config.requests['bar'] != undefined, 'Request should have been created.');
assert.equal(1, register.config.requests.bar.length, 'Request should have one command.');

// Register two commands
register.route('bar')
  .does(common.TestCommand,'test-command')
	.does(common.TestCommand, 'test-command2')
;

assert.ok(register.config.requests['bar'] != undefined, 'Request should have been created.');
assert.equal(2, register.config.requests.bar.length, 'Request should have one command.');
assert.equal('test-command2', register.config.requests.bar[1].name, 'Command name should be properly set.');
assert.equal(common.TestCommand, register.config.requests.bar[0].command, 'Check that command is correct.');

// Test setting values for params.
register.route('withArgs')
	.does(common.TestCommand, 'test-command')
		.using('myParam', 'test value')
	.does(common.TestCommand, 'test-command2')
		.using('myParam','test value2')
	.does(common.TestCommand, 'test-command3')
		.using('myParam', '').from('cxt:test-command')
;

assert.equal('test value', register.config.requests.withArgs[0].params.myParam.value, 'Test that default value is set.');
assert.equal('test value2', register.config.requests.withArgs[1].params.myParam.value, 'Test that default value is set.');
assert.equal('cxt:test-command', register.config.requests.withArgs[2].params.myParam.from, 'Test that from is set.');

// Test getAllRequests
var allRequests = register.getAllRequests();
var allRequestKeys = Object.keys(allRequests);
assert.equal(2, allRequestKeys.length);
assert.equal('bar', allRequestKeys[0]);

// Also test that the getRequestSpec() function works:
var spec = register.getRequestSpec('withArgs');
assert.ok(spec, 'Spec should exist.');
assert.equal('test value', spec[0].params.myParam.value, 'Test that default value is set.');

// Check that an Error is thrown when a nonexistenc request spec is fetched.

assert.throws(function() {registry.getRequestSpec('NoSuchRequestName');console.log('foo')}, '/No Sflurp request/', 'Should throw an exception if no requst is found.')


// Test registry includes() failure:
assert.throws(function() {register.route('a').includes('b')}, '/Cannot include undefined route/');
assert.throws(function() {register.route('a').includes('a')}, '/vicious/');


// Test registry includes().
register
.route('includeMe')
  .does(common.TestCommand, 'two')
  .does(common.TestCommand, 'three')
.route('includeMeTest')
  .does(common.TestCommand, 'one')
  .includes('includeMe')
  .does(common.TestCommand, 'four')
  .does(common.TestCommand, 'five')
;

spec = register.getRequestSpec('includeMeTest');

assert.ok(spec);
assert.equal(spec[0].name, 'one');
assert.equal(spec[2].name, 'three');
assert.equal(spec[3].name, 'four');

// Test help system.

register = new pronto.Registry();
register
.route('TestOne', "this is help text").does(common.TestCommand)
.route('TestTwo', {msg: "this is also help text"}).does(common.TestCommand)
.route('NoHelp').does(common.TestCommand)
;

assert.equal(register.getHelp('TestOne').msg, "this is help text");
assert.equal(register.getHelp('TestTwo').msg, "this is also help text");
assert.equal(0, register.getHelp('NoHelp').msg.length);