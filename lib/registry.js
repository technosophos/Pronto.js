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




/**
 * The registry.
 * This is currently a Singleton, which is not a great pattern. Will 
 * probably refactor this into a standard class.
 */


/*
var Registry = {
	config: {requests:[]}
  ,currentIndex: -1
  ,currentParamName: null
  ,currentRequestName: null
};

Registry.request = function(name){
  this.currentRequestName = name;
  this.config.requests[name] = [];
  this.currentIndex = -1;
  return this;
}

Registry.doesCommand = function(cmd){
  //console.log(this.currentIndex);
	++this.currentIndex
  this.config.requests[this.currentRequestName][this.currentIndex] = {
    name: cmd, 
    params: {},
    command: null,
    params: {}
  };
  return this;
}

Registry.whichInvokes = function(invokes){
	//console.log('Setting command for index ' + this.currentIndex);
  this.config.requests[this.currentRequestName][this.currentIndex].command = invokes;
  return this;
}
Registry.usingParam = function(paramName){
  this.currentParamName = paramName;
  this.config.requests[this.currentRequestName][this.currentIndex].params[this.currentParamName] = {};
  return this;
}
Registry.withValue = function(value){
  this.config.requests[this.currentRequestName][this.currentIndex].params[this.currentParamName].value = value;
  return this;
}
Registry.withDefault = function(value){
  return this.withValue(value);
}
Registry.from = function(fromString){
  this.config.requests[this.currentRequestName][this.currentIndex].params[this.currentParamName].from = fromString;
  return this;
}
*/

