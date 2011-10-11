var pronto = require('../lib/pronto');
var FAIL = require('./common').FailingCommand;
var assert = require('assert');
var client = require('http');

var register = new pronto.Registry();

register

.request('/test')
	.does('../lib/commands/HTTPResponse', 'out')
	.using('body', 'This is a test.')

.request('/test/*/test')
	.does('../lib/commands/HTTPResponse', 'out')
	.using('body', 'This is a test.').from('path:1')

.request('/fail')
	.does(FAIL, 'out')
	.using('body', 'This is a test.')
	
.request('@404')
	.does('../lib/commands/HTTPResponse', 'out')
	.using('code', 404)
	.using('contentType', 'text/markdown')
	.using('body', 'Bork bork bork.')
	
;
	
var cxt = new pronto.Context();
cxt.add('base-item', 'test');

var server = pronto.HTTPServer.createServer(register, cxt);
server.listen(8000, 'localhost');

//require('repl').start().context.register = register;
/*
var clientOpts = {
	host: 'localhost'
	,port: 8000
	,method: 'GET'
	,path: '/test'
};

client.request(clientOpts, function(res) {
	res.on('data', function (data) {console.log(data)});
	
});

server.close();
*/