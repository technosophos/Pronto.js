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
	
	if (registry !instanceof pronto.Registry) {
		throw new Error('Registry is not valid. Nothing to do.');
	}
	
	this.baseContext = cxt instanceof Context ? cxt : new Context();
	this.registry = registry;
	this.router = new Pronto.router(registry);
	
	http.Server.call(this, this.serve);
	
}
util.inherits(HTTPServer, http.Server);

HTTPServer.prototype.serve = function(request, response) {
	var cxt = this.prepareContext(request, response);

	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end('Working...');

	console.log(cxt);
	console.log(this.baseContext);
}

HTTPServer.prototype.prepareContext = function(request, response) {
	
	var cxt = this.baseContext.copy();
	
	var url = URL.parse(request.url, true);
	request.parsedUrl = url;
	
	
	
	cxt.request = request;
	
	// Insert GET
	cxt.addDatasource('get', url.query);
	
	// Insert headers
	cxt.addDatasource('header', request.headers);
	
	// Insert cookies
	// If post, insert POST
	// Set output stream
	
	return cxt;
	
}

ServerUtil = {};
