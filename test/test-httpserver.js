var pronto = require('../lib/pronto');
var assert = require('assert');

var server = pronto.HTTPServer.createServer(new pronto.Registry());

assert.ok(server instanceof pronto.HTTPServer.HTTPServer);

var cxt = new pronto.Context({
  ssl: true,
  sslKey: '',
  sslCertificate: ''
});
console.log(cxt.getAll());
var sslServer = pronto.HTTPServer.createServer(new pronto.Registry(), cxt);
assert.ok(sslServer instanceof pronto.HTTPServer.HTTPSSLServer);

