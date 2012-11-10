var util = require('util');
var Stream = require('stream');
var Buffer = require('buffer').Buffer;

/**
 * Buffer a readable stream.
 *
 * Pass it a stream, and then use this as a 
 * stream. It buffers until open() is called,
 * at which time it begins emitting data until
 * it is empty.
 *
 * This basically acts like the http.IncommingMessage that comes with
 * node, with the exception that the stream is paused by default. You
 * must use open() to initially open the stream.
 *
 * This should not be used to hold large streams for long periods of
 * time, as it consumes memory.
 */
function BufferedReader(stream) {
  Stream.call(this);

  var self = this;
  this.stream = stream;
  this.buffers = [];
  this.isReading = true;
  this.error = false;
  this.emitClose = false;
  this.isPaused = true;

  stream.on('data', function (buffer) {
    if (self.isPaused) {
      self.buffers.push(buffer);
    } else {
      self.emit('data', buffer);
    }
  });
  stream.on('end', function () {
    self.isReading = false;
    if (!self.isPaused) {
      self._allDone();
    }
  });
  stream.on('error', function (e) {
    self.error = e;
    if (!self.isPaused) {
      self.emit('error', e);
    }
  });
  stream.on('close', function () {
    self.emitClose = true;
  });
}
module.exports = BufferedReader;
util.inherits(BufferedReader, Stream);

BufferedReader.prototype.open = function () {
  this.resume();
}
BufferedReader.prototype.resume = function () {
  this.isPaused = false;
  this._emitPending();
}

BufferedReader.prototype.setEncoding = function (encoding) {
  this._encoding = encoding;
  var StringDecoder = require('string_decoder').StringDecoder
  this._decoder = new StringDecoder(encoding);
}

BufferedReader.prototype.hasBufferedData = function () {
  return buffers.length > 0;
}

BufferedReader.prototype._emitPending = function (fn) {
  // If there is a buffered error, spit it out.
  if (this.error) {
    this.emit('error', this.error);
    delete this.buffers;
    this._allDone();
  }

  // Otherwise, loop through the buffered data and emit it.
  if (this.buffers.length > 0) {

    var self = this;
    process.nextTick(function () {
      while (!self.isPaused && self.buffers.length) {
        var b = self.buffers.shift();

        // Some streams mark the end with this.
        if (b === {}) {
          self._allDone();
        }
        else {
          self._emitData(b)
        }

        if (fn) {
          fn();
        }
      }
      if (!self.isReading) {
        self._allDone();
      }
    });

  }
  else if (fn) {
    fn();
  }
}

BufferedReader.prototype.destroy = function () {
  delete this.buffers;
  if (stream.destroy) {
    this.stream.destroy();
  }
}
BufferedReader.prototype._emitData = function (data) {
  if (this._decoder) {
    data = this._decoder.write(data);
  }
  this.emit('data', data);
}
BufferedReader.prototype._allDone = function () {
  this.emit('end');
  if (this.emitClose) {
    this.emit('close');
  }
}
