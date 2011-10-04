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

var doneWasFired = false;
router.on('done', function (context) {
	assert.ok(context instanceof pronto.Context);
	
	doneWasFired = true;
});

router.handleRequest('foo');

assert.ok(execWasFired, '"exec" event must be executed.');
assert.ok(doneWasFired, '"done" event must be executed.');