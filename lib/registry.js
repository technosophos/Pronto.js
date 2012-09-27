module.exports = Registry;

/**
 * Use the registry to map requests to chains of commands.
 */
function Registry() {
  this.config = {
    requests: [],
    loggers: []
  };
  this.help = {};
  this.currentIndex = -1;
  this.currentParamName = null;
  this.currentRequestName = null;
}

/**
 * Define a new request.
 *
 * @param {string} requestName
 *  The name of the request.
 * @param {string|Object} helptext
 *  If this is a string, then it will be stored as the message
 *  for help text.
 *
 *  If this is an object, it will be stored as a help text object.
 *  An object should have the `msg` property defined.
 *
 * @return this
 */
Registry.prototype.route = function(requestName, helptext) {
  this.currentRequestName = requestName;
  this.config.requests[requestName] = [];
  this.currentParamName = null;
  this.currentIndex = -1;
  this.help[requestName] = {msg: ''};

  if (helptext != undefined) {
    if (typeof helptext == 'string') {
      this.help[requestName].msg = helptext;
    }
    else {
      this.help[requestName] = helptext;
    }
  }

  return this;
}

/** 
 * Deprecated.
 */
Registry.prototype.request = Registry.prototype.route;

/**
 * Include all of the commands in the named route.
 *
 * This has the effect of inserting all of the commands
 * in the named route directly into this chain.
 *
 * @param {string} routeName
 *  The name of the route to include. This route must be
 *  declared BEFORE the route that includes it.
 */
Registry.prototype.includes = function (routeName) {
  
  if (routeName == this.currentRequestName) {
    throw new Error('Detected vicious circle in ' + routeName + '.includes()');
  }
  
  var other = this.config.requests[routeName];
  if (other == undefined) {
    throw new Error('Cannot include undefined route.');
  }
  
  var tmp = this.config.requests[this.currentRequestName];
  this.config.requests[this.currentRequestName] = tmp.concat(other);
  this.currentIndex += other.length;
  
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
 * @param {string} commandName
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
 * Add a logger.
 */
Registry.prototype.logger = function(loggerObject, options) {
  this.config.loggers.push({logger: loggerObject, options: options});
  return this;
}

Registry.prototype.getLoggers = function () {
  return this.config.loggers;
}

/**
 * Given a request name, get the specification for that request.
 */
Registry.prototype.getRequestSpec = 
Registry.prototype.getRouteSpec = function(name) {
  return this.config.requests[name];
}

Registry.prototype.getAllRequests =
Registry.prototype.getAllRoutes = function() {
  return this.config.requests;
}

/**
 * Given a request name, get the associated help text.
 *
 * The help system is optional, so there may be no help text.
 */
Registry.prototype.getHelp = function (routeName) {
  return this.help[routeName] || {msg: ''};
}
