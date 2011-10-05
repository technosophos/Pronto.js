/**
 * A context tracks the context of a particular execution queue.
 *
 * As the queue is processed, the context will gain information
 * about the results of each command executed.
 */

module.exports = Context;

function Context() {
  this.resultMap = {};
	this.datasourceMap = {};

	// Preserve order by keeping keys in a list.
	// This should be optimized.
	this.resultOrder = [];
	
	// Debug flag.
  this.debug = false;
}

Context.prototype.add = function(name, value) {
  if (value == undefined)
    return;
  
	if (this.resultMap[name] == undefined) {
		this.resultOrder.push(name);
	}
  this.resultMap[name] = value;
  
}
Context.prototype.get = function(name) {
  return this.resultMap[name];
}

// Property 'length'.
Context.prototype.__defineGetter__('length', function() {
	return this.size();
});

Context.prototype.size = function() {
	return this.resultOrder.length;
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

// XXX: I don't like having one object serve as the compartment for both
// general objects and datasources. This should get refactored. But for
// the first go-around, I feel like I should favor simplicity.

Context.prototype.addDatasource = function(name, ds) {
	this.datasourceMap[name] = ds;
}

Context.prototype.getDatasource = function(name) {
	return this.datasourceMap[name];
}

Context.prototype.removeDatasource = function(name) {
	this.datasourceMap[name] = null;
}