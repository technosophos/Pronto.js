/**
 * A context tracks the context of a particular execution queue.
 *
 * As the queue is processed, the context will gain information
 * about the results of each command executed.
 */

module.exports = Context;

function Context() {
  this.resultMap = {};
  this.debug = false;
}

Context.prototype.add = function(name, value) {
  if (value == undefined)
    return;
  
  this.resultMap[name] = value;
}
Context.prototype.get = function(name) {
  return this.resultMap[name];
}
Context.prototype.getAll = function() {
  return this.resultMap;
}
Context.prototype.log = function(msg, level) {
  if (level == 'debug' && !this.debug) {
    return;
  }
  console.log(level + ': ' + msg);
}
