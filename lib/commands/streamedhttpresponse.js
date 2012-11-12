/**
 * Send a response as chunked data.
 *
 * This serves a similar purpose to httpresponse, but for streams.
 */
var util = require('util');
var pronto = require('../pronto');
var Buffer = require('buffer').Buffer;

/**
 * Issue an HTTP response to a client.
 *
 * This handles an individual response case
 * for an HTTP request. Standard IO like writing
 * headers and body data are handled here.
 *
 * Params:
 * - code: The HTTP response code (default: 200)
 * - contentType: The MIME type of the returned content. (Default: text/plain)
 * - headers: An object containing the headers as name/value pairs.
 * - stream: The stream to write to the body.
 * - encoding: The character encoding used to write the body. This data is not 
 *    used in the request. (Default: utf8)
 */
function StreamedHTTPResponse() {
}
util.inherits(StreamedHTTPResponse, pronto.Command);
module.exports = StreamedHTTPResponse;

StreamedHTTPResponse.prototype.execute = function(cxt, params) {
  var code = params.code || 200;
  var headers = params.headers || {};
  var encoding = params.encoding || 'utf8'; // Unused

  var contentType = params.contentType;
  var contentLength = params.contentLength;
  var stream = params.stream;
  
  //var req = cxt.getDatasource('request');
  var response = cxt.getDatasource('response');

  if (contentType != undefined) {
    headers['Content-Type'] = contentType;
  }
  else if (headers['Content-Type'] == undefined) {
    headers['Content-Type'] = 'text/plain';
  }
  if (contentLength) {
    headers['Content-Length'] = contentLength;
  }

  response.writeHead(code, headers);

  // Okay... now it's time to push out the data
  // as fast as possible.
  if (stream && stream.pipe) {
    // Unpause a stream.
    if (stream.resume) {
      stream.resume();
    }
    // Stream in the background.
    stream.pipe(response);
  }
  else {
    response.end();
  }
  this.done();
}
