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

HTTPResponse.prototype.execute = function(cxt, params) {
  var code = params.code || 200;
  var contentType = params.contentType;
  var headers = params.headers || {};
  var body = params.body || '';
  var encoding = params.encoding || 'utf8';
  
  var req = cxt.request;
  var response = cxt.getDatasource('response');
  
  //console.log(cxt);
  
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