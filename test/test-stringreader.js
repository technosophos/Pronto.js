var assert = require('assert');
var Buffer = require('buffer').Buffer;
var StringReader = require('../lib/streams/stringreader');

var input = "This is the song that never ends...";

var sr = new StringReader(input);
var tbuff = '';

sr.on('data', function (data) {
  console.log("Received %s", data);
  tbuff += data;
});

sr.on('end', function () {
  console.log('Checking output.');
  assert.equal(input, tbuff);
});

sr.resume();
