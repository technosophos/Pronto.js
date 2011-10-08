var common = require('./common');
var pronto = require('../lib/pronto.js');
var assert = require('assert');

// Test constructor
var cxt  = new pronto.Context();

assert.ok(!cxt.debug, 'Debug should be turned off by default');

// Test accessor and mutator.
cxt.add('foo', 'bar');
assert.equal('bar', cxt.get('foo'), 'Accessor should get the same data as was placed by mutator.');

// Canary test
cxt.add('foo2', 42);
assert.equal(42, cxt.get('foo2'), 'Accessor should still get the same data as was placed by mutator.');

// Test overwrite
cxt.add('foo2', 1337);
assert.equal(1337, cxt.get('foo2'), 'Accessor should be overwritten.');

// Test size() && length
assert.equal(2, cxt.size());
assert.equal(2, cxt.length);

// Test getAll()
var list = cxt.getAll();
assert.ok(list.foo2 != undefined, 'Keys should exist');
assert.equal(list.foo, 'bar', 'Key should have original value.');

// Test logger
var sb = '';
var sbLogger = function(msg, level) {
	sb += level + ':' + msg;
}
cxt.setLogger(sbLogger);
cxt.log('test msg', 'level');
assert.equal('level:test msg', sb);