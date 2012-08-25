/*!
 * Provide a closure command.
 */
var pronto = require('../pronto');
module.exports = Closure;
function Closure(){}
pronto.inheritsCommand(Closure);

/**
 * Execute a function as a command.
 *
 * This requires a single param, `fn`, which should point to a 
 * function that takes the following three arguments:
 *
 * - context: The present context
 * - params: The present params
 * - cmd: This command
 *
 * A function MUST emit notifiction that it is finished. 
 * (e.g. cmd.done(), cmd.stop(), cmd.reroute() or cmd.error())
 *
 * Params:
 * - fn: A callback function that takes context, params, and cmd as arguments.
 */
Closure.prototype.execute = function (context, params) {
  this.required(params, ['fn']);
  
  var fn = params.fn;
  var cmd = this;
  
  fn(context, params, cmd);
}
