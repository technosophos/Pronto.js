var assert = require('assert');
var pronto = require('../lib/pronto');

var AddToContext = pronto.commands.AddToContext;

var reg = new pronto.Registry();
var cxt = new pronto.Context();

reg
  .request('Test')
	  .does(AddToContext, 'added')
      .using('test1', 'test2')
      .using('test3', true)
      .using('test4', 42)
;

runner = new pronto.Router(reg);
runner.once('commandListComplete', function(cxt) {
  assert.equal(cxt.get('test1'), 'test2');
  assert.equal(cxt.get('test3'), true);
  assert.equal(cxt.get('test4'), 42);
  assert.equal(cxt.get('added').length, 3);
  console.log('Test complete');
});
runner.handleRequest('Test', cxt);
