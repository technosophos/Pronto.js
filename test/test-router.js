var common = require('./common');
var pronto = require('../lib/pronto.js');
var assert = require('assert');

// Register two commands
pronto.register.request('foo')
	.doesCommand('test-command')
	.whichInvokes(common.TestCommand)
;

// Canary:
var spec = pronto.register.getRequestSpec('foo');
assert.ok(spec, 'Spec must exist.');

// Construct a router:
var router = new pronto.Router();

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
pronto.register.request('failure').doesCommand('fails').whichInvokes(common.FailingCommand);

router = new pronto.Router();
assert.throws(function() {router.handleRequest('failure')}, /I feel sick/, "Catch error event");

// Test a failed route:
var wasNotFoundFired = false;
router.on('error', function() { wasNotFoundFired = true; });
router.handleRequest('NOTFOUND');
