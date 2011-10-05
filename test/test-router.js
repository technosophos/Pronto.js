var common = require('./common');
var pronto = require('../lib/pronto.js');
var assert = require('assert');

var register = new pronto.Registry();

// Register two commands
register.request('foo').does(common.TestCommand,'test-command');

// Canary:
var spec = register.getRequestSpec('foo');
assert.ok(spec, 'Spec must exist.');

// Construct a router:
var router = new pronto.Router(register);

// Test the resolver. Normally, this is done internally.
var rname = router.resolveRequest('foo');
assert.equal('foo', rname, 'Request name should be "foo".');

var execWasFired = false;
router.on('exec', function (spec, context) {
	assert.ok(context instanceof pronto.Context);
	//assert.ok(spec instanceof StinkyCheese);
	execWasFired = true;
});

// This should have fired when the chain completed.
var doneWasFired = false;
router.on('done', function (context) {
	assert.ok(context instanceof pronto.Context);
	
	doneWasFired = true;
});

// Test event routing.
// This should have bubbled up from the command(s)
var commandContinueFired = false;
router.on('commandContinue', function(spec, cxt) {
	assert.ok(cxt instanceof pronto.Context, 'Make sure continue event got right args.');
	commandContinueFired = true;
})

router.handleRequest('foo');

assert.ok(execWasFired, '"exec" event must be executed.');
assert.ok(doneWasFired, '"done" event must be executed.');
assert.ok(commandContinueFired, '"commandContinue" event executed at least once.');

// Test the error handling.
register.request('failure').does(common.FailingCommand, 'fails');

router = new pronto.Router(register);
assert.throws(function() {router.handleRequest('failure')}, /I feel sick/, "Catch error event");

// Test a failed route:
var wasNotFoundFired = false;
router.on('error', function() { wasNotFoundFired = true; });
router.handleRequest('NOTFOUND');

// Test that params are passed from Router into the request:
var doneFired = false;
register.request('foo3')
	.does(common.TestCommand, 'test-command')
		.using('foo', 'bar')
		.using('foo2', 'bar2');
router.setRegistry(register);

router.once('done', function(cxt) {
	doneFired = true;
	//console.log(cxt);
	assert.ok(cxt.get('test-command-params'), 'Should be a context');
	assert.equal('bar', cxt.get('test-command-params').foo);
	assert.equal('bar2', cxt.get('test-command-params').foo2);
})
router.handleRequest('foo3');
assert.ok(doneFired, 'Done event should fire on request completion.');
