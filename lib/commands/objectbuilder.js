var pronto = require('../pronto');
function ObjectBuilder(){}
pronto.inheritsCommand(ObjectBuilder);
module.exports = ObjectBuilder;

/**
 * Transform params into an object.
 *
 * This converts the given params into an object, and places the 
 * object into the context.
 *
 * This is a useful way of constructing an object with the values 
 * passed in using from().
 *
 * PARAMS:
 *
 *  - Anything you pass in will be returned.
 */
ObjectBuilder.prototype.execute = function(cxt, params){
  this.done(params);
}
