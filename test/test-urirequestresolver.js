var Registry = require('../lib/Registry');
var Resolver = require('../lib/urirequestresolver');
var common = require('./common');
var assert = require('assert');

var register = new Registry();

register
	.request('/a').does(common.TestCommand)
	.request('/a/b').does(common.TestCommand)
	.request('/a/b/c').does(common.TestCommand)
	.request('/a/b/*').does(common.TestCommand)
	.request('/a/b/*/d/e/f/g/h').does(common.TestCommand)
	.request('/a/b/a').does(common.TestCommand)
	.request('/a/c').does(common.TestCommand)
	.request('@internal/foo').does(common.TestCommand)
	.request('a/c').does(common.TestCommand)
;

var rez = new Resolver();
rez.buildTree(register);

assert.equal('/a', rez.resolve('/a'));
assert.equal('/a/b', rez.resolve('/a/b'));
assert.equal('/a/b/c', rez.resolve('/a/b/c'));
assert.equal('/a/b/*', rez.resolve('/a/b/WILDCARD'));
assert.equal('/a/b/*/d/e/f/g/h', rez.resolve('/a/b/WILDCARD/d/e/f/g/h'));
assert.equal('/a/b/*/d/e/f/g/h', rez.resolve('/a/b/Old macdonald had  a farm/d/e/f/g/h'));
assert.equal('/a/b/a', rez.resolve('/a/b/a'));
assert.equal('/a/c', rez.resolve('/a/c'));
assert.equal('@internal/foo', rez.resolve('@internal/foo'));
assert.equal('a/c', rez.resolve('a/c'));

assert.equal(undefined, rez.resolve('a/b/c'));
assert.equal(undefined, rez.resolve('/b/b/c'));
assert.equal(undefined, rez.resolve('/a/b/a/b'));