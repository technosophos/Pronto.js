var Stream = require('stream');
var assert = require('assert');
var fs = require('fs');
var Buffer = require('buffer').Buffer;
var StreamReader = require('../lib/streams').BufferedReader;

//var file = fs.createReadStream('test/ssl/pronto-test-cert.pem');
var file = fs.createReadStream('/var/log/dpkg.log.1');
var reader = new StreamReader(file);

var c = 0;
file.on('data', function (data) { 
  console.log('Emitting data'); 
  ++c;
  if (c == 2) {
    reader.open();
  }
});
file.on('end', function (data) { console.log('Done emitting data'); });

reader.on('data', function (data) {
  console.log('Buffered reader emitting %s byte chunk', data.length);
});

reader.on('end', function () {
  console.log('Buffered reader ended');
});

reader.on('close', function () {
  console.log('Buffered reader closed');
});
reader.on('error', function (e) {
  console.log(e);
});

/**
setTimeout(function () {
  console.log('waking up.');
  reader.open();
}, 2000);
*/
