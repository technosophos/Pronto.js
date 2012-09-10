var pronto = require('../lib/pronto');
var assert = require('assert');

var testPOST = 'Name=Jonathan+Doe&Age=23&Formula=a+%2B+b+%3D%3D+13%25%21';
var testJSON = '{"Name": "Jonathan Doe", "Age": 23}';
var cxt = new pronto.Context();

// Fake a request:
var request = {
	headers:{
		'Content-Type': 'application/x-www-form-urlencoded'
	},
	method: 'POST'
};

pronto.HTTPServer.HTTPServerUtils.parseRequestBody(request, cxt, testPOST);

// Test form encoded data.
assert.ok(cxt.getDatasource('post'), 'There should be a POST datasource.');
var pData = cxt.getDatasource('post');

assert.equal('Jonathan Doe', pData.Name, "Test value of Name in parsed POST.");
assert.equal(23, pData.Age, "Test value of Age in POST data");

// Test JSON-encoded data
cxt = new pronto.Context();
request.headers['Content-Type'] = 'application/json';

pronto.HTTPServer.HTTPServerUtils.parseRequestBody(request, cxt, testJSON);
assert.ok(cxt.getDatasource('post'), 'There should be a JSON datasource.');
var pData = cxt.getDatasource('post');
assert.equal('Jonathan Doe', pData.Name, "Test value of Name in parsed JSON.");
assert.equal(23, pData.Age, "Test value of Age in JSON data");

