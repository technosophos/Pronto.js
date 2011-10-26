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
router.on('commandsStart', function (spec, context) {
	assert.ok(context instanceof pronto.Context);
	//assert.ok(spec instanceof StinkyCheese);
	execWasFired = true;
});

// This should have fired when the chain loader has started the chain.
var doneWasFired = false;
router.on('commandsLaunched', function (context) {
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

// Test wheter CommandListComplete works.
var commandListCompleteFired = 0;
router.on('commandListComplete', function() {
	commandListCompleteFired++;
});

router.handleRequest('foo');

assert.ok(execWasFired, '"commandsStart" event must be executed.');
assert.ok(doneWasFired, '"commandsLaunched" event must be executed.');
assert.ok(commandContinueFired, '"commandContinue" event executed at least once.');
assert.equal(1, commandListCompleteFired, '"commandListComplete" should be fired ONLY once. Was fired ' + commandListCompleteFired);

// Test the error handling.
register.request('failure')
  .does(common.TestCommand, 'test-command')
  .does(common.FailingCommand, 'fails');

router = new pronto.Router(register);
assert.throws(function() {router.handleRequest('failure')}, /I feel sick/, "Catch error event");

// Test throwing an error in a command.
register.request('failure')
  .does(common.TestCommand, 'test-command')
  .does(common.ErrorThrowingCommand, 'fails');

router = new pronto.Router(register);
assert.throws(function() {router.handleRequest('failure')}, /Throw me/, "Catch error event");


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

router.once('commandListComplete', function(cxt) {
	doneFired = true;
	//console.log(cxt);
	assert.ok(cxt.get('params-test-command'), 'Should be a context');
	assert.equal('bar', cxt.get('params-test-command').foo);
	assert.equal('bar2', cxt.get('params-test-command').foo2);
})
router.handleRequest('foo3');
assert.ok(doneFired, 'commandListComplete event should fire on request completion.');

// Test passing a context into router:
register.request('testContext').does(common.TestCommand, 'testCmd').using('foo').from('get:q');
var cxt2 = new pronto.Context();
cxt2.addDatasource('get', {'q': 1234});
testContextFired = false;
router.once('commandListComplete', function(cxt) {
	testContextFired = true;
	assert.equal(1234, cxt2.get('params-testCmd').foo);
})

router.handleRequest('testContext', cxt2);
assert.ok(testContextFired, 'Context test fired.');

// Test taint mode:
register.route('@internal').does(common.TestCommand);
assert.throws(function(){router.handleRequest('@internal', cxt, true)}, '/taint/');
router.handleRequest('@internal');
