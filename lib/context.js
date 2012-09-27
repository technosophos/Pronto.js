/**
 * A context tracks the context of a particular execution queue.
 *
 * As the queue is processed, the context will gain information
 * about the results of each command executed.
 */
var Logger = require('./logging').Logger;

module.exports = Context;

function Context(initialValues) {
  this.resultMap = {};
  this.datasourceMap = {};

  // Debug flag.
  this.debug = false;

  // The logging event emitter.
  this.logger = new Logger();

  // This was initially done for safety.
  // Could this just be turned into 
  // this.resultMap = intialvalues || {}
  if (typeof initialValues == 'object') {
    for (var name in initialValues) {
      this.add(name, initialValues[name]);
    }
  }
}

Context.prototype.add = function(name, value) {
  if (value == undefined)
    return;
  
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
  // Since size is called rarely, we 
  // calculate on the fly.
  var i = 0;
  for (var o in this.resultMap) {
    ++i;
  }
  return i;
}
Context.prototype.getAll = function() {
  return this.resultMap;
}

/**
 * Log a message to the logging facility.
 *
 * Attach an event listen to cxt.logger.
 * Then handle the following events (at your option):
 *
 * - warning
 * - fatal
 * - error
 * - info
 * - debug
 * - custom
 *
 * Note that the parameters are in reverse order for historical reasons.
 *
 * @param {String} msg
 *   The message.
 * @param {String} level
 *   THe log level.
 */
Context.prototype.log = function(msg, level) {
  this.logger.log(level || "info", msg);
}

Context.prototype.setLogger = function(logger) {
  this.logger = logger;
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

/**
 * A partial clone of a context.
 *
 * This returns a new context with the same data
 * and datasources as the base. Note that the 
 * values in this context are not cloned. So modifying them
 * will modify the base copy as well.
 */
Context.prototype.copy = function() {
  var cxt = new Context();
  var map = this.getAll();
  for (var key in map) {
    cxt.add(key, map[key]);
  }
  for (var key in this.datasourceMap) {
    cxt.addDatasource(key, this.datasourceMap[key]);
  }
  return cxt;
}
