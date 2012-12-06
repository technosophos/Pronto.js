var pronto = require('../pronto');
function AddToContext(){}
pronto.inheritsCommand(AddToContext);
module.exports = AddToContext;

/**
 * Add all of the given parameters to the context.
 *
 * This allows you to place data into the context.
 *
 * PARAMS:
 *
 *  - Anything you pass in will be inserted as name/value pairs into the
 *    context.
 *
 * This returns a list of the parameter names that it inserts into the
 * context.
 */
AddToContext.prototype.execute = function(cxt, params){
  var names = [];
  for (var param in params) {
    cxt.add(param, params[param]);
    names.push(param);
  }
  this.done(names);
}
