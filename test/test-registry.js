var common = require('./common');
var pronto = require('../lib/pronto.js');
var assert = require('assert');

var c = pronto.register.config;

// Register just a request. CANARY. Remove this, as it is testing an invalid state.
pronto.register.request('foo');
assert.ok(c.requests['foo'] != undefined, 'Request should have been created.');


// Register one command
pronto.register.request('bar').doesCommand('test-command').whichInvokes(common.TestCommand);
assert.ok(pronto.register.config.requests['bar'] != undefined, 'Request should have been created.');
assert.equal(1, pronto.register.config.requests.bar.length, 'Request should have one command.');

// Register two commands
pronto.register.request('bar')
  .doesCommand('test-command').whichInvokes(common.TestCommand)
	.doesCommand('test-command2').whichInvokes(common.TestCommand)
;

assert.ok(pronto.register.config.requests['bar'] != undefined, 'Request should have been created.');
assert.equal(2, pronto.register.config.requests.bar.length, 'Request should have one command.');
assert.equal('test-command2', c.requests.bar[1].name, 'Command name should be properly set.');
assert.equal(common.TestCommand, c.requests.bar[0].command, 'Check that command is correct.');


pronto.register.request('withArgs')
	.doesCommand('test-command').whichInvokes(common.TestCommand)
		.withParam('myParam').withValue('test value')
	.doesCommand('test-command2').whichInvokes(common.TestCommand)
		.withParam('myParam').withDefault('test value2')
	.doesCommand('test-command3').whichInvokes(common.TestCommand)
		.withParam('myParam').from('cxt:test-command')
;

assert.equal('test value', c.requests.withArgs[0].params.myParam, 'Test that default value is set.');
assert.equal('test value2', c.requests.withArgs[1].params.myParam, 'Test that default value is set.');
assert.equal('cxt:test-command', c.requests.withArgs[2].from, 'Test that from is set.');