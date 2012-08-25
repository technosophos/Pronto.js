var assert = require('assert');
var pronto = require('../lib/pronto');
//var JSONEncode = require('../lib/commands/jsonencode');
var JSONEncode = pronto.commands.JSONEncode;

var reg = new pronto.Registry();
var cxt = new pronto.Context();
var objToEncode = {'foo': 'bar', 'hello': 'world'};
cxt.add('encodeMeBaby', objToEncode);

reg
  .request('jsonTest')
	  .does(JSONEncode, 'encoded').using('data').from('cxt:encodeMeBaby')
;

runner = new pronto.Router(reg);
runner.once('commandListComplete', function(cxt) {
	var str = cxt.get('encoded')
	assert.ok(typeof str == 'string');
	assert.equal(JSON.stringify(objToEncode), str);
});
runner.handleRequest('jsonTest', cxt);
