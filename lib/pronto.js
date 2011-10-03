
var util = require('util');

// Local requirements.
var Context = require('./context');
var CommandList = require('./commandlist');
var Command = require('./command');
var Configuration = require('.configuration');

exports.Context = Context;
exports.CommandList = CommandList;
exports.Command = Command;
exports.Presto = Presto;
exports.Configuration = exports.declare = Configuration;


// Router?


// Request Runner
function Presto(config) {
  this.config = config;
}

Presto.prototype.handleRequest = function(request) {
  var realRequest = this.resolveRequest(request);
  
  if (this.config.requests[realRequest] == undefined) {
    // throw what?
    console.log('no such request found');
    return;
  }
  
  var queue = new CommandList(this.config);
  var context = new Context();
  queue.run(context, request);
  
  return context;
}

Presto.prototype.resolveRequest = function(requestName) {
  // Return just the request name for now.
  return requestName;
}

