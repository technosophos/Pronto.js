var Registry = require('../lib/Registry');
var Resolver = require('../lib/urirequestresolver');
var common = require('./common');
var assert = require('assert');

var register = new Registry();

register
	.request('a').does(common.TestCommand)
	.request('a/b').does(common.TestCommand)
	.request('a/b/c').does(common.TestCommand)
	.request('a/b/*').does(common.TestCommand)
	.request('a/b/a').does(common.TestCommand)
	.request('a/c').does(common.TestCommand)
;

var rez = new Resolver();
rez.buildTree(register);

console.log(rez.tree);