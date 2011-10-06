var http = require('http');
var Context = require('./context');
var Router = require('./router');
var URL = require('url');
var util = require('util');
//var QS = require('querystring');

exports.createServer = createServer;

function createServer(registry, rootContext) {
	return new HTTPServer(registry, rootContext);
}

function HTTPServer(registry, cxt) {
	
	this.baseContext = cxt instanceof Context ? cxt : new Context();
	http.Server.call(this, this.serve);
	
}
util.inherits(HTTPServer, http.Server);

HTTPServer.prototype.serve = function(request, response) {
	console.log(this.cxt);
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end('Working...');
}

HTTPServer.prototype.prepareContext = function(cxt, request, response) {
	var url = URL.parse(request.url, true);
	request.parsedUrl = url;
	// Insert GET
	cxt.add('get', request.query);
	// Insert headers
	
	// Insert cookies
	// If post, insert POST
	// Set output stream
	
}

ServerUtil = {};
