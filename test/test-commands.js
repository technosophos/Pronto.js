var assert = require('assert');
var pronto = require('../lib/pronto');

assert.ok(pronto.commands != undefined);
assert.ok(pronto.commands.Hello != undefined);
assert.ok(pronto.commands.JSONEncode != undefined);
assert.ok(pronto.commands.Closure != undefined);
assert.ok(pronto.commands.ObjectBuilder != undefined);
assert.ok(pronto.commands.HTTPResponse != undefined);
