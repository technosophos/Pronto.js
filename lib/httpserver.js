var http = require('http');
var https = require('https');
var URL = require('url');
var util = require('util');
var QS = require('querystring');

var Context = require('./context');
var Router = require('./router');
var Registry = require('./registry');
var URIRequestResolver = require('./urirequestresolver');

/**
 * 100k
 */
var MAX_PARSEABLE_BODY_LENGTH = 1024 * 100;

exports.createServer = createServer;

exports.HTTPServerUtils = HTTPServerUtils = {};
/**
 * LEGACY AND DEPRECATED
 */
exports.ServerImpl = HTTPServerUtils;

exports.HTTPServer= HTTPServer;
exports.HTTPSSLServer= HTTPSSLServer

/**
 * Create a new HTTP or HTTPS server.
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
 *
 * To create an HTTPS (SSL) server, you need to add the following three items
 * to your root context:
 *
 * - ssl: {bool} true
 * - sslKey: {Buffer|String} SSL key
 * - sslCertificate: {Buffer|String} SSL certificate
 */
function createServer(registry, rootContext) {
  var srv;
  if (rootContext && rootContext.get('ssl')) {
    //console.log(rootContext.getAll());
    var opts = {
      key: rootContext.get('sslKey'),
      cert: rootContext.get('sslCertificate')
    }
    srv = new HTTPSSLServer(registry, rootContext, opts);
  }
  else {
    srv  = new HTTPServer(registry, rootContext);
  }
  return srv;
}

/**
 * A base HTTP server implementation.
 *
 * DO NOT INSTANTIATE THIS DIRECTLY.
 *
 * This is an abstract prototype that contains just the
 * methods necessary for augmenting HTTP service.
 *
 * Concrete implementations include:
 *
 * - HTTPServer: HTTP support.
 * - HTTPSSLServer: HTTPS support.
 */
function BaseHTTPServer(registry, cxt) {
  // Code here should only happen once -- at startup.
  
  
  if (!(registry instanceof Registry)) {
    throw new Error('Registry is not valid. Nothing to do.');
  }
 
  this.baseContext = cxt instanceof Context ? cxt : new Context();
  this.registry = registry;
  
  // Create a new router.
  this.router = router = new Router(registry);
  this.baseContext.setLogger(this.router.logEmitter);
  
  // Set up the default request resolver.
  var resolver = new URIRequestResolver();
  resolver.init(registry);
  router.setRequestResolver(resolver);
  
  // Catch error events emitted by the Router.
  this.router.on('error', function(err, eCxt) {
    if (/Request not found/.test(err.message)) {
      HTTPServerUtils.notFound(eCxt, router, err);
    }
    else {
      HTTPServerUtils.fatalError(eCxt, router, err);
    }
  });

  this.serverStartup();
  this.initializeServiceHandler();

}

/**
 * Handle the actual request.
 *
 * This uses a pronto.Router to route requests. It does not
 * peform any output on its own. pronto.commands.HTTPResponse
 * (or similar) should be used for that.
 */
BaseHTTPServer.prototype.serve = function(request, response) {
  // This function is called oncer per request.

  // First, we set up the context.
  var cxt = this.prepareContext(request, response);

  // Next, we route the request. An error that
  // trickles to the top will kill the HTTP server
  // if we don't catch it. So any Error that gets
  // here becomes a 500.
  var target = request.parsedUrl.pathname
  try {
    // Note that we are in taint mode.
    this.router.handleRequest(target, cxt, true);
  }
  catch (err) {
    HTTPServerUtils.fatalError(cxt, this.router, err);
    // FIXME: This is a last-ditch attempt to prevent the server from
    // leaving a socket hanging open.
    /* COMMENTED OUT until proven necessary.
    if (response.socket) {
      // Try to force a flush/end
      response.socket.end();
    }
   */
  }
}

// Override the main close.
/*
BaseHTTPServer.prototype.close = function () {
  this.serverShutdown();
  //console.log(require('util').inspect(this, true, 2));
  
  console.log(require('util').inspect(this, true, 3, true));

  // Call the parent's close().
  //BaseHTTPServer.super_.prototype.close.call(this);
  this.prototype.super_.prototype.close.call(this);
  //http.Server.prototype.close.call(this)
}
*/

BaseHTTPServer.prototype.serverStartup = function () {
  // Before we start serving, we allow the system to initialize
  // if a @serverStartup target exists in the registry:
  if (this.router.hasRequest('@serverStartup')) {
    // We don't wait for this, so there could be race
    // conditions on server startup.
    this.router.handleRequest('@serverStartup', this.baseContext);
  }
}

BaseHTTPServer.prototype.serverShutdown = function () {
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
BaseHTTPServer.prototype.setResolver = function (resolver) {
  this.router.setRequestResolver(resolver);
  // resolver.build();
}

/**
 * Generate a context for an HTTP request.
 * Each request gets its own pronto.Context. This generates the
 * context, adding get, headers, post, etc. into the context.
 *
 * Important details: 
 * - context.datasources gain:
 *   - get (set anytime there are params in the URL, following PHP's model)
 *   - header
 *   - post/put/delete (or whatever method)
 *   - cookie
 *   - request
 *   - response
 * - context.getDatasource('request').parsedUrl holds the parsed URL.
 */
BaseHTTPServer.prototype.prepareContext = function(request, response) {

  // Clone base context.
  var cxt = this.baseContext.copy();
  //cxt.setLogger(this.router.logEmitter);

  // Parse the URL.
  var url = URL.parse(request.url, true);
  request.parsedUrl = url;

  // Insert request and response.
  cxt.addDatasource('request', request);
  cxt.addDatasource('response', response);

  // Insert GET
  cxt.addDatasource('get', url.query);

  // Insert headers
  cxt.addDatasource('header', request.headers);

  // Insert cookies
  // TODO: Parse and store cookies.

  // If post, put, delete, insert a datasource with the
  // required data.
  //if (request.method != 'GET' && request.method != 'HEAD') {


  // IMPORTANT:
  // If the request seems to have a body, and the body is short-ish, we
  // attempt to store and maybe even parse the body. This makes 
  // POST/PUT operations much easier to deal with.
  //
  // However, we don't parse messages larger than MAX_PARSEABLE_BODY_LENGTH
  // because we do not want to consime too much memory. Instead, larger
  // bodies must be retrieved from the stream itself, which we add
  // as a BufferedReader.
  var contentLength = parseInt(request.headers['content-length']) || 0;
  if (contentLength > 0 && contentLength < MAX_PARSEABLE_BODY_LENGTH) {
    var sb = '';
    request.on('data', function(chunk) { sb += chunk; });
    request.on('end', function () {HTTPServerUtils.parseRequestBody(request, cxt, sb)});
    request.on('close', function () {/*console.log("|||Server closed");*/ });
  }

  // Insert path index
  var path = url.pathname.split('/');
  // Remove empty space caused by leading slash.
  path.shift();
  cxt.addDatasource('path', path);

  return cxt;

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
HTTPServerUtils.fatalError = function(cxt, router, err) {
  var request = cxt.getDatasource('request');
  var response = cxt.getDatasource('response');

  // Force a closed connection
  response.setHeader("Connection", "close");

  if (router.hasRequest('@500')) {
    cxt.add('error', err);
    router.handleRequest('@500', cxt);
  }
  else {
    if (request) {
      console.log(request.url);
    }
    console.log(err.stack);
    var msg = 'Server error';
    response.writeHead(500, {
      'Content-Type': 'text/plain',
      'Content-Length': msg.length
    });
    response.end(msg);
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
HTTPServerUtils.notFound = function(cxt, router, err) {
  var response = cxt.getDatasource('response');
  if (router.hasRequest('@404')) {
    router.handleRequest('@404', cxt);
  }
  else {
    var msg = 'Page not found';
    response.writeHead(404, {
      'Content-Type': 'text/plain',
      'Content-Length': msg.length
    });
    response.end(msg);
  }
}

/**
 * Parse the contents of a client request body.
 *
 * Some requests, like POST and PUT, have a body. This
 * attempts to parse the body only if the content type is
 * one of www-form-urlencoded or json.
 */
HTTPServerUtils.parseRequestBody = function(request, cxt, data) {
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

HTTPServerUtils.parseCookies = function(request, cxt) {
  if (request.headers.cookie == undefined) {
    cxt.addDatasource('cookie', {});
    return;
  }
  // FIXME
  var regex = '/([a-zA-Z0-9]+)=[\'"]+([^\'";,])[\'"]+[;,]/';
}

/**
 * Build a new HTTP server.
 *
 * To follow the core API, the preferred method for constructing a new
 * HTTP server is using pronto.createServer().
 */
function HTTPServer(registry, cxt) {
  BaseHTTPServer.call(this, registry, cxt);
}
util.inherits(HTTPServer, http.Server);
mixIn(HTTPServer, BaseHTTPServer);
HTTPServer.prototype.initializeServiceHandler = function () {
  http.Server.call(this, this.serve);
}
HTTPServer.prototype.close = function() {
  this.serverShutdown();
  http.Server.prototype.close.call(this);
}

/**
 * Build a new HTTPS server.
 *
 * To follow the core API, the preferred method for constructing a new
 * HTTP server is using pronto.createServer().
 */
function HTTPSSLServer(registry, cxt, options) {
  this.sslOptions = options;
  BaseHTTPServer.call(this, registry, cxt);
}
util.inherits(HTTPSSLServer, https.Server);
mixIn(HTTPSSLServer, BaseHTTPServer);
HTTPSSLServer.prototype.initializeServiceHandler = function () {
  https.Server.call(this, this.sslOptions, this.serve);
}
HTTPSSLServer.prototype.close = function() {
  this.serverShutdown();
  https.Server.prototype.close.call(this);
}

// TODO: When we cut to a more modern version of Node.js, we can
// probably use util._extend().
function mixIn(ctor, mixin) {
  for (part in mixin.prototype) {
    ctor.prototype[part] = mixin.prototype[part];
  }
}
