var util = require('util');
var pronto = require('pronto');

module.exports = JSONEncode;

function JSONEncode () {}
util.inherits(JSONEncode, pronto.Command);

/**
 * Transform data into JSON strings.
 *
 * This uses JSON.stringify to convert data into a JSON string. The
 * result is then placed into the context.
 */
JSONEncode.prototype.execute = function (cxt, params) {
	var data = params.data || {};
	this.done(JSON.stringify(data));
}