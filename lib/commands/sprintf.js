var pronto = require('../pronto');
var util = require('util');
function SPrintF(){}
pronto.inheritsCommand(SPrintF);
module.exports = SPrintF;

/**
 * Simple sprintf template.
 *
 * This takes to arguments:
 *
 * %s: title
 * %s: body
 */
SPrintF.HTML5 = (function () {
  return "<!DOCTYPE html>\n<html>\n<head>\n"
  + "<meta charset=\"utf-8\">\n<title>%s</title>\n</head>\n"
  + "<body>%s</body></html>";
})();

SPrintF.prototype.execute = function(cxt, params){
  var filter = params.format|| "%s";
  delete params.format;

  var allArgs = [filter];
  for (param in params) {
    allArgs.push(params[param]);
  }

  var res = util.format.apply(this,allArgs);
  this.done(res);
}
