var assert = require('assert');
var log = require('../lib/logging');

var fac = new log.Logger();

/*
var out = new log.ConsoleLogger(fac);
*/

function TestLogger(logger) {
  c = 0;
  logger.on('error', function (f, m) { assert.equal('error', f); c++ });
  logger.on('info', function (f, m) { assert.equal('info', f); c++ });
}
var out = new TestLogger(fac);

fac.log('error', 'TEST');
fac.log('info', "This is an info string.");
fac.log('custom', "Don't catch.");
