module.exports = Registry;

/**
 * Use the registry to map requests to chains of commands.
 */
function Registry() {
  this.config = {requests:[]};
  this.currentIndex = -1;
  this.currentParamName = null;
  this.currentRequestName = null;
}

/**
 * Define a new request.
 */
Registry.prototype.request = function(requestName) {
  this.currentRequestName = requestName;
  this.config.requests[requestName] = [];
  this.currentParamName = null;
  this.currentIndex = -1;

  return this;
}

/**
 * Attach a command to a request.
 *
 * Multiple commands can be attached to a single request.
 *
 * @param {string, Command} callable
 *  If this is a string, it will be require'd into the context: `new require(callable)()`.
 *  If this is an object, it will be constructed: `new callable()`.
 * @param string commandName
 *  Commands should be given request-unique names so that (a) they can be referenced elsewhere,
 *  and (b) the system can allow multiple instances of the same command.
 *  If no name is supplied, one will be generated. This is not recommended.
 */
Registry.prototype.does = function(callable, commandName) {
  if (commandName == null) {
    commandName = Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  
  ++this.currentIndex
  this.config.requests[this.currentRequestName][this.currentIndex] = {
    name: commandName, 
    //params: {},
    command: callable,
    params: {}
  };

  return this;
}

/**
 * Instruct Pronto to pass a particular parameter into the current command.
 */
Registry.prototype.using = function(name, defaultValue) {
  this.currentParamName = name;
  this.config.requests[this.currentRequestName][this.currentIndex].params[name] = {
    value: defaultValue
  }
  return this;
}

/**
 * Instruct pronto to fetch a value from the resolveSource.
 *
 * This value is then given to the last-defined parameter.
 *
 * Example resolveSource values:
 *
 * - `cxt:foo` look up the value `foo` in the context. Same as Context.get('foo');
 * - `get:q`  For HTTP services, use the value of the GET parameter `q`.
 * - `get:bar cxt:bar` Try to use the GET param `bar`, but fall back to the `bar` in the context.
 */ 
Registry.prototype.from = function(resolveSource) {
  this.config.requests[this.currentRequestName][this.currentIndex].params[this.currentParamName].from = resolveSource;
  return this;
}

/**
 * Given a request name, get the specification for that request.
 */
Registry.prototype.getRequestSpec = function(name) {
  return this.config.requests[name];
}

Registry.prototype.getAllRequests = function() {
  return this.config.requests;
}