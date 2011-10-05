module.exports = Registry;

function Registry() {
	this.config = {requests:[]};
  this.currentIndex = -1;
  this.currentParamName = null;
  this.currentRequestName = null;
}

Registry.prototype.request = function(requestName) {
	this.currentRequestName = requestName;
	this.config.requests[requestName] = [];
  this.currentIndex = -1;

	return this;
}

Registry.prototype.does = function(callable, commandName) {
	if (commandName == null) {
		commandName = Date.now() + '-' + Math.floor(Math.random() * 1000);
	}
	
	++this.currentIndex
  this.config.requests[this.currentRequestName][this.currentIndex] = {
    name: commandName, 
    params: {},
    command: callable,
    params: {}
  };

  return this;
}

Registry.prototype.using = function(name, defaultValue) {
	this.currentParamName = name;
	this.config.requests[this.currentRequestName][this.currentIndex].params[name] = {
		value: defaultValue
	}
	return this;
}

Registry.prototype.from = function(resolveSource) {
	this.config.requests[this.currentRequestName][this.currentIndex].params[this.currentParamName].from = resolveSource;
  return this;
}

Registry.prototype.getRequestSpec = function(name) {
	return this.config.requests[name];
}