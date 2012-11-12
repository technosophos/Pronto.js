/**
 * A context tracks the context of a particular execution queue.
 *
 * As the queue is processed, the context will gain information
 * about the results of each command executed.
 */
var util = require('util');
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
 * @param {String|Object} msg
 *   The message. If this is an object, it will be run through util.inspect().
 * @param {String|Number} ...
 *   Zero or more primatives that will be interpolated into `msg` using util.format().
 * @param {String} level
 *   THe log level.
 */
Context.prototype.log = function(msg, level) {
  if (arguments.length > 2) {
    var interp = Array.prototype.slice.call(arguments, 0, -1);
    msg = util.format.apply(this, interp);
  }
  else if (typeof msg != 'string') {
    msg = util.inspect(msg);
  }
  var logLevel = arguments.length > 2 ? arguments[arguments.length - 1] : level;
  this.logger.log(logLevel || "info", msg);
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

/**
 * Get a datasource.
 *
 * This will retrieve a named datasource.
 *
 * @param {String} name
 *   The name of the datasource.
 * @return {Object}
 *   The datasource.
 */
Context.prototype.datasource =
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

  cxt.setLogger(this.logger);

  var map = this.getAll();
  for (var key in map) {
    cxt.add(key, map[key]);
  }
  for (var key in this.datasourceMap) {
    cxt.addDatasource(key, this.datasourceMap[key]);
  }
  return cxt;
}
