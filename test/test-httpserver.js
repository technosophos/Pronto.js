var pronto = require('../lib/pronto');
var assert = require('assert');
var fs = require('fs');

var server = pronto.HTTPServer.createServer(new pronto.Registry());

assert.ok(server instanceof pronto.HTTPServer.HTTPServer);

var cxt = new pronto.Context({
  ssl: true,
  sslKey: fs.readFileSync('test/ssl/pronto-test-key.pem'),
  sslCertificate: fs.readFileSync('test/ssl/pronto-test-cert.pem')
});
var sslServer = pronto.HTTPServer.createServer(new pronto.Registry(), cxt);
assert.ok(sslServer instanceof pronto.HTTPServer.HTTPSSLServer);

