var common = require('./common');
var pronto = require('../lib/pronto.js');
var assert = require('assert');

var register = new pronto.Registry();

register.request('foo').does(common.TestCommand, 'test-command');

var spec = register.getRequestSpec('foo');

// Canary:
assert.ok(spec, 'Request spec must exist and be non-null.');
assert.equal(1, spec.length, 'There should be only one request.');
assert.equal('test-command', spec[0].name, 'Name of first command should be "test-command"');

// Test a command list
var clist = new pronto.CommandList('foo', spec);

clist.next()
assert.ok(!clist.hasNext(), 'Should only be one command.');

// Rewind and start again.
clist.rewind();
assert.equal(0, clist.position);

// Test that there is a TestCommand in first command
assert.ok(clist.current().command == common.TestCommand, "First command should be a TestCommand.");

var cxt = new pronto.Context();

clist.run(cxt);

assert.equal('ok', cxt.get('test-command'), 'Assert that test command returned correctly.');

// Now try again with two commands, which will force execNext() to run.
register.request('foo2')
	.does(common.TestCommand,'test-command')
	.does(common.TestCommand, 'test-command2')
;

// Canary test on new spec.
spec = register.getRequestSpec('foo2');
assert.ok(spec, "Spec should be valid");

clist = new pronto.CommandList('foo2', spec);
clist.next();
assert.ok(clist.current().command == common.TestCommand, "Second command should be a TestCommand.");
clist.rewind();

cxt = new pronto.Context();

clist.run(cxt);

// Check that all commands are run.
assert.equal('ok', cxt.get('test-command'), 'Assert that first test command returned correctly.');
assert.equal('ok', cxt.get('test-command2'), 'Assert that second test command returned correctly.');


//Test from-resolver
cxt.add('FOO', 1234);
assert.equal(1234, clist.resolveFromSpec('c:FOO', cxt));
assert.equal(1234, clist.resolveFromSpec('cxt:FOO', cxt));
assert.equal(1234, clist.resolveFromSpec('context:FOO', cxt));

cxt.addDatasource('get', {'test': 4321});
assert.equal(4321, clist.resolveFromSpec('get:test', cxt));