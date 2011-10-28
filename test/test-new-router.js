var common = require('./common');
var pronto = require('../lib/pronto.js');
var assert = require('assert');

var register = new pronto.Registry();
var router = new pronto.Router(register);

// Testing router depth:

register
.request('/test')
  .does(common.TestCommand)
.request('depth')
  //.does(common.TestCommand)
  .does(common.DumpStack, 1)
  .does(common.DumpStack, 2)
  .does(common.DumpStack, 3)
  .does(common.DumpStack, 4)
  .does(common.DumpStack, 5)
.request('targetroute')
  .does(common.TestCommand, 'cmd1')
.request('testreroute')
  .does(common.ReRoute, 'shouldreroute').using('routeTo', 'targetroute')
  .does(common.ErrorThrowingCommand)
.request('teststop')
  .does(common.Stop, 'shouldStop')
  .does(common.ErrorThrowingCommand)
;
//router.handleRequest('depth');

var completed = 0;
var stopped = 0;
var rerouted = 0;

router.on('commandListComplete', function(cxt){
  console.log('complete');
  ++completed;
});
router.on('commandListInterrupted', function (r, spec, cxt) {
  console.log(r);
  //console.log('stopped')
  ++stopped;
});
router.on('reroute', function (routeName, cxt) {
  assert.equal(routeName, 'targetroute');
  ++rerouted;
})

router.handleRequest('testreroute');
router.handleRequest('teststop');

assert.equal(1, completed);
assert.equal(1, stopped);
assert.equal(1, rerouted);

//Test from-resolver
var cxt = new pronto.Context();
cxt.add('FOO', 1234);
assert.equal(1234, router.resolveFromSpec('c:FOO', cxt));
assert.equal(1234, router.resolveFromSpec('cxt:FOO', cxt));
assert.equal(1234, router.resolveFromSpec('context:FOO', cxt));

cxt.addDatasource('get', {'test': 4321});
assert.equal(4321, router.resolveFromSpec('get:test', cxt));