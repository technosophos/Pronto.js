var pronto = require('../pronto');
var BufferedReader = require('../streams/bufferedreader');
/**
 * Buffer the input stream of a request.
 *
 * This allows the incomming HTTP body to be buffered until it is later
 * needed.This is very useful in cases where other longish transactions
 * (like database queries) must happen before input is used.
 *
 * This puts a streams.BufferedReader into the context.
 *
 * IMPORTANT: The returned stream will be paused. Use BufferedReader.open()
 * or BufferedReader.resume() to start emitting data from the stream.
 *
 * IMPORTANT: Large uploads plus long delays will result in larger consumption
 * of system resources (e.g. memory).
 *
 * Params
 *
 * - stream: The stream to buffer. If not supplied, the request is
 *   buffered. (OPTIONAL)
 */
function BufferRequest(){}
pronto.inheritsCommand(BufferRequest);
module.exports = BufferRequest;

BufferRequest.prototype.execute = function(cxt, params) {
  var source = params.stream || cxt.getDatasource('request');
  var dest = new BufferedReader(source);

  this.done(dest);
}
