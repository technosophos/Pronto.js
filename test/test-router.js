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