var http = require('http');
var Context = require('./context');
var Router = require('./router');
var Registry = require('./registry');
var URL = require('url');
var util = require('util');
var QS = require('querystring');
var URIRequestResolver = require('./urirequestresolver');

exports.createServer = createServer;
exports.ServerImpl = HTTPServer;

/**
 * Create a new HTTP server.
 *
 * The registry is required. This should be a pronto.Registry instance
 * with at least one request defined.
 *
 * Optionally, a root pronto.Context can be passed here. Its datasources
 * and context data will be copied into the request's context.
 * See Context.copy() for implementation details.
 *
 * During a given request, the HTTP server may add some or all of these
 * as datasources in the context:
 *
 * - request: The request object
 * - response: The response object
 * - get: Name/value pairs from the query string. This may be present in POST/PUT/HEAD, etc.
 * - post: POST data. Decodes www-form-encode and JSON data.
 * - put: PUT data. See POST.
 * - clientbody: The body data. The value 'raw' contains the raw data. EXPERIMENTAL
 * - cookie: Cookie data
 * - path: The URI path, indexed by position. /foo/bar/baz becomes: path:0, path:1, path:2.
 * - header: The HTTP headers. E.g. from('header:Content-Type') will return the client's Content-Type header.
 *
 * These can be accessed with Context.getDatasource() or in the 
 * registry's from() method (e.g. from('path:1 get:query'))
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
	
	// Create a new router.
	this.router = router = new Router(registry);
	
	// Set up the default request resolver.
	var resolver = new URIRequestResolver();
	resolver.init(registry);
	router.setRequestResolver(resolver);
	
	// Catch error events emitted by the Router.
	this.router.on('error', function(err, eCxt) {
		if (/Request not found/ (err.message)) {
			HTTPServer.notFound(eCxt, router, err);
		}
		else {
			HTTPServer.fatalError(eCxt, router, err);
		}
	});
	
	this.serverStartup();
	
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

// Override the main close.
HTTPServer.prototype.close = function () {
	this.serverShutdown();
	//console.log(require('util').inspect(this, true, 2));
	console.log(this.__proto__);

	// Call the parent's close().
	HTTPServer.super_.prototype.close.call(this);
	//http.Server.prototype.close.call(this)
}

HTTPServer.prototype.serverStartup = function () {
	// Before we start serving, we allow the system to initialize
	// if a @serverStartup target exists in the registry:
	if (this.router.hasRequest('@serverStartup')) {
		// This gets the actual base context, so that it can modify
		// it if necessary.
		var initialCxt = this.baseContext.copy();
		initialCxt.add('baseContext', this.baseContext);
		
		// We don't wait for this, so there could be race
		// conditions on server startup.
		this.router.handleRequest('@serverStartup', initialCxt);
	}
	
}

HTTPServer.prototype.serverShutdown = function () {
	if (this.router.hasRequest('@serverShutdown')) {
		var cxt = this.baseContext.copy();
		this.router.handleRequest('@serverShutdown', cxt);
	}
}

/**
 * Set the resolver used to direct requests to the registry.
 *
 * A resolver is used to map the URI received from the client
 * to a particular result in the registry. By default, this
 * uses the URIRequestResolver. You may supply your own.
 */
HTTPServer.prototype.setResolver = function (resolver) {
	this.router.setRequestResolver(resolver);
	resolver.build();
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
	
	// Clone base context.
	var cxt = this.baseContext.copy();
	
	// Parse the URL.
	var url = URL.parse(request.url, true);
	request.parsedUrl = url;
	
	// FIXME: These should be datasources, not raw attributes.
	cxt.request = request;
	cxt.response = response;
	
	// Insert GET
	cxt.addDatasource('get', url.query);
	
	// Insert headers
	cxt.addDatasource('header', request.headers);
	
	// Insert cookies
	// TODO: Parse and store cookies.
	
	// If post, put, delete, insert a datasource with the
	// required data.
	if (request.method != 'GET' && request.method != 'HEAD') {
		var sb = '';
		request.on('data', function(chunk) { sb += chunk; });
		request.on('end', HTTPServer.parseRequestBody(request, cxt, sb));
	}
	
	// Insert path index
	var path = url.pathname.split('/');
	// Remove empty space caused by leading slash.
	path.shift();
	cxt.addDatasource('path', path);
	
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

/**
 * Parse the contents of a client request body.
 *
 * Some requests, like POST and PUT, have a body. This
 * attempts to parse the body only if the content type is
 * one of www-form-urlencoded or json.
 */
HTTPServer.parseRequestBody = function(request, cxt, data) {
	var ctype = request.headers['Content-Type'] || '';
	var pData = '';
	var method = request.method.toLowerCase();
	
	cxt.addDatasource('clientbody', {'raw': data});
	try {
		if (ctype.indexOf('application/json') >= 0) {
			// JSON decode
			pData = JSON.parse(data);
		}
		else if(ctype.indexOf('application/x-www-form-urlencoded') >= 0) {
			// QS parse
			pData = QS.parse(data);
		}
		// Skip other content types. It's up to the app layer to parse those.
	}
	// In case of an error, we log an error, but don't kill the
	// request. The raw data is still available.
	catch (e) {
		cxt.log(e, 'error');
		return;
	}
	cxt.addDatasource(method, pData);
	
}

HTTPServer.parseCookies = function(request, cxt) {
	if (request.headers.cookie == undefined) {
		cxt.addDatasource('cookie', {});
		return;
	}
	// FIXME
	var regex = '/([a-zA-Z0-9]+)=[\'"]+([^\'";,])[\'"]+[;,]/';
}