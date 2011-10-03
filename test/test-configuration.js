var common = require('./common');
var pronto = require('../lib/pronto.js');
var assert = require('assert');

pronto.declare.request('foo');

assert.ok(pronto.configuration.config.requests['foo'] != undefined, 'Request should have been created.');