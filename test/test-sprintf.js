var assert = require('assert');
var pronto = require('../lib/pronto');
var sprintf = pronto.commands.SPrintF;

var reg = new pronto.Registry();
var cxt = new pronto.Context();

cxt.add('name', 'Matt');

reg
  .request('sprintfTest')
	  .does(sprintf, 'sprintf')
      .using('format', '%s-%s-%d')
      .using(1, 'One')
      .using(2).from('cxt:name')
      .using(3, 3)
      ;
;

runner = new pronto.Router(reg);
runner.once('commandListComplete', function(cxt) {
	var str = cxt.get('sprintf')
	assert.ok(typeof str == 'string');
	assert.equal('One-Matt-3', str);
});
runner.handleRequest('sprintfTest', cxt);
