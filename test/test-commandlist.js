var common = require('./common');
var pronto = require('../lib/pronto.js');
var assert = require('assert');

pronto.register.request('foo')
	.doesCommand('test-command')
	.whichInvokes(common.TestCommand)
;

var spec = pronto.register.getRequestSpec('foo');

// Canary:
assert.ok(spec, 'Request spec must exist and be non-null.');
assert.equal(1, spec.length, 'There should be only one request.');
assert.equal('test-command', spec[0].name, 'Name of first command should be "test-command"');

var clist = new pronto.CommandList('foo', spec);

assert.ok(!clist.next().hasNext(), 'Should only be one command.');

// Rewind and start again.
clist.rewind();
assert.equal(0, clist.position);

assert.ok(clist.current().command == common.TestCommand, "First command should be a TestCommand.");

var cxt = new pronto.Context();

clist.run(cxt);

assert.equal('ok', cxt.get('test-command'), 'Assert that test command returned correctly.');

// Now try again with two commands, which will force execNext() to run.
pronto.register.request('foo2')
	.doesCommand('test-command').whichInvokes(common.TestCommand)
	.doesCommand('test-command2').whichInvokes(common.TestCommand)
;

// Canary test on new spec.
spec = pronto.register.getRequestSpec('foo2');
assert.ok(spec, "Spec should be valid");

clist = new pronto.CommandList('foo2', spec);
assert.ok(clist.next().current().command == common.TestCommand, "Second command should be a TestCommand.");
clist.rewind();

cxt = new pronto.Context();

clist.run(cxt);

// Check that all commands are run.
assert.equal('ok', cxt.get('test-command'), 'Assert that first test command returned correctly.');
assert.equal('ok', cxt.get('test-command2'), 'Assert that second test command returned correctly.');