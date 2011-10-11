var pronto = require('../lib/pronto');
var FAIL = require('./common').FailingCommand;
var LogCommand = require('./common').LogCommand;
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

.request('@serverStartup')
	.does(LogCommand, 'start')
		.using('msg', 'Starting up')
		.using('level', 'info')
		
.request('@serverShutdown')
	.does(LogCommand, 'stop')
		.using('msg', 'Shutting down')
		.using('level', 'info')
;
	
var cxt = new pronto.Context();
cxt.add('base-item', 'test');

var server = pronto.HTTPServer.createServer(register, cxt);

server.on('close', function() {console.log('close')});

server.listen(8000, 'localhost');

// Test close()
//setTimeout(function(){server.close()}, 2000);
