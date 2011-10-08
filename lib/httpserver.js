var http = require('http');
var Context = require('./context');
var Router = require('./router');
var Registry = require('./registry');
var URL = require('url');
var util = require('util');
var QS = require('querystring');

exports.createServer = createServer;

/**
 * Create a new HTTP server.
 *
 * The registry is required. This should be a pronto.Registry instance
 * with at least one request defined.
 *
 * Optionally, a root pronto.Context can be passed here. Its datasources
 * and context data will be copied into the request's context.
 * See Context.copy() for implementation details.
 */
function createServer(registry, rootContext) {
	return new HTTPServer(registry, rootContext);
}

/**
 * Build a new HTTP server.
 *
 * To follow the core API, the preferred method for constructing a new
 * HTTP server is using pronto.createServer().
 */
function HTTPServer(registry, cxt) {
	// Code here should only happen once -- at startup.
	
	
	if (!(registry instanceof Registry)) {
		throw new Error('Registry is not valid. Nothing to do.');
	}
	
	this.baseContext = cxt instanceof Context ? cxt : new Context();
	this.registry = registry;
	this.router = router = new Router(registry);
	
	// Catch error events emitted by the Router.
	this.router.on('error', function(err, eCxt) {
		if (/Request not found/ (err.message)) {
			HTTPServer.notFound(eCxt, router, err);
		}
		else {
			HTTPServer.fatalError(eCxt, router, err);
		}
	});
	
	http.Server.call(this, this.serve);
	
}
util.inherits(HTTPServer, http.Server);

/**
 * Handle the actual request.
 *
 * This uses a pronto.Router to route requests. It does not
 * peform any output on its own. pronto.commands.HTTPResponse
 * (or similar) should be used for that.
 */
HTTPServer.prototype.serve = function(request, response) {
	// This function is called oncer per request.
	
	// First, we set up the context.
	var cxt = this.prepareContext(request, response);
	
	// Next, we route the request. An error that
	// trickles to the top will kill the HTTP server
	// if we don't catch it. So any Error that gets
	// here becomes a 500.
	var target = request.parsedUrl.pathname
	try {
		this.router.handleRequest(target, cxt);
	}
	catch (err) {
		HTTPServer.fatalError(cxt, this.router, err);
	}
	
}

/**
 * Generate a context for an HTTP request.
 * Each request gets its own pronto.Context. This generates the
 * context, adding get, headers, post, etc. into the context.
 *
 * Important details: 
 * - context.request and context.response hold HTTP request & response
 * - context.datasources gain 'get', 'header', 'post', and 'cookie'.
 * - context.request.parsedUrl holds the parsed URL.
 */
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
	
	
	// If post, put, delete, insert a datasource with the
	// required data.
	if (request.method != 'GET' && request.method != 'HEAD') {
		var sb = '';
		request.on('data', function(chunk) { sb += chunk; });
		request.on('end', HTTPServer.parseRequestBody(request, cxt, sb));
	}
	// Set output stream
	
	return cxt;
	
}

/**
 * Generate a 404.
 * Bail-out function for when the router returns
 * a "Request not found" error.
 *
 * This is static, as everything we need is passed into
 * the function. For this reason, others can call this
 * without side-effect so long as the call has an 
 * HTTP-ready context.
 */
HTTPServer.fatalError = function(cxt, router, err) {
	console.log(cxt.request.url + "\n" + err.stack);
	if (router.hasRequest('@500')) {
		router.handleRequest('@500', cxt);
	}
	else {
		var msg = 'Server error';
		cxt.response.writeHead(500, {
			'Content-Type': 'text/plain',
			'Content-Length': msg.length
		});
		cxt.response.end(msg);
	}
}

/**
 * Generate a 500.
 * Bail-out function for when the router returns
 * a "Request not found" error.
 *
 * This is static, as everything we need is passed into
 * the function. For this reason, others can call this
 * without side-effect so long as the call has an 
 * HTTP-ready context.
 */
HTTPServer.notFound = function(cxt, router, err) {
	if (router.hasRequest('@404')) {
		router.handleRequest('@404', cxt);
	}
	else {
		var msg = 'Page not found';
		cxt.response.writeHead(404, {
			'Content-Type': 'text/plain',
			'Content-Length': msg.length
		});
		cxt.response.end(msg);
	}
}

HTTPServer.parseRequestBody = function(request, cxt, data) {
	var ctype = request.headers['Content-Type'] || '';
	var pData = '';
	var method = request.method.toLowerCase();
	
	cxt.addDatasource('clientbody', {'raw': data});
	try {
		if (ctype.indexOf('application/json')) {
			// JSON decode
			pData = JSON.parse(data);
		}
		else {
			// QS parse
			pData = QS.parse(data);
		}
	}
	// In case of an error, we log an error, but don't kill the
	// request. The raw data is still available.
	catch (e) {
		cxt.log(e, 'error');
		return;
	}
	cxt.addDatasource(method, pData);
	
}