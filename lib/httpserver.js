var http = require('http');
var Context = require('./context');
var Router = require('./router');
var Registry = require('./registry');
var URL = require('url');
var util = require('util');
//var QS = require('querystring');

exports.createServer = createServer;

function createServer(registry, rootContext) {
	return new HTTPServer(registry, rootContext);
}

function HTTPServer(registry, cxt) {
	// Code here should only happen once -- at startup.
	
	
	if (!(registry instanceof Registry)) {
		throw new Error('Registry is not valid. Nothing to do.');
	}
	
	this.baseContext = cxt instanceof Context ? cxt : new Context();
	this.registry = registry;
	this.router = new Router(registry);
	
	http.Server.call(this, this.serve);
	
}
util.inherits(HTTPServer, http.Server);

HTTPServer.prototype.serve = function(request, response) {
	// This function is called oncer per request.
	
	// First, we set up the context.
	var cxt = this.prepareContext(request, response);
	
	// Next, we route the request.
	var target = request.parsedUrl.pathname
	this.router.handleRequest(target, cxt);

	/*
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end('Working...');
	*/

	//console.log(cxt);
	console.log(this.baseContext);
}

HTTPServer.prototype.prepareContext = function(request, response) {
	
	var cxt = this.baseContext.copy();
	
	var url = URL.parse(request.url, true);
	request.parsedUrl = url;
	
	cxt.request = request;
	cxt.response = response;
	
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
