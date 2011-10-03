module.exports = {
  config: {requests:[]}
  ,currentIndex: -1
  ,currentParamName: null
  ,currentRequestName: null
  ,request: function(name){
    this.currentRequestName = name;
    this.config.requests[name] = [];
    this.currentIndex = -1;
    return this;
  }
  ,doesCommand: function(cmd){
    console.log(this.currentIndex);
    this.config.requests[this.currentRequestName][this.currentIndex] = {
      name: cmd, 
      params: {},
      command: null,
      params: {}
    };
    ++this.currentIndex;
    return this;
  }
  ,whichInvokes: function(invokes){
    this.config.requests[this.currentRequestName][this.currentIndex].command = invokes;
    return this;
  }
  ,usingParam: function(paramName){
    this.currentParamName = paramName;
    return this;
  }
  ,withValue: function(value){
    this.config.requests[this.currentRequest][this.currentIndex].params[this.currentParamName].value = value;
    return this;
  }
  ,withDefault: function(value){
    return this.withValue(value);
  }
  ,from: function(fromString){
    this.config.requests[this.currentRequest][this.currentIndex].params[this.currentParamName].from = value;
    return this;
  }
}