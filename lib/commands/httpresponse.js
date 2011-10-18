var util = require('util');
var pronto = require('../pronto');

module.exports = HTTPResponse;

/**
 * Issue an HTTP response to a client.
 *
 * This handles an individual response case
 * for an HTTP request. Standard IO like writing
 * headers and body data are handled here.
 */
function HTTPResponse() {
  
}
util.inherits(HTTPResponse, pronto.Command);

/*
HTTPControl.prototype.init = function(name) {
  this.super_.prototype.init.call(this, name);
}
*/

/**
 * Send an HTTP response.
 *
 * Assumptions:
 * This assumes that the `response` datasource has been set. Typically, the HTTP server
 * sets this during startup.
 *
 * Params:
 * - code: The HTTP response code (default: 200)
 * - contentType: The MIME type of the returned content. (Default: text/plain)
 * - headers: An object containing the headers as name/value pairs.
 * - body: The content that will be sent as the body of this HTTP response.
 * - encoding: The character encoding used to write the body. This data is not 
 *    used in hte request. (Default: utf8)
 */
HTTPResponse.prototype.execute = function(cxt, params) {
  var code = params.code || 200;
  var contentType = params.contentType;
  var headers = params.headers || {};
  var body = params.body || '';
  var encoding = params.encoding || 'utf8';
  
  //var req = cxt.getDatasource('request');
  var response = cxt.getDatasource('response');
  
  if (contentType != undefined) {
    headers['Content-Type'] = contentType;
  }
  else if (headers['Content-Type'] == undefined) {
    headers['Content-Type'] = 'text/plain';
  }
  
  // XXX: Change body to a Buffer and call byteLength.
  headers['Content-Length'] = body.length;
  
  response.writeHead(code, headers);
  response.end(body, encoding);
  
  this.done();
}