var util = require('util');
var Command = require('../command');

module.exports = JSONEncode;

function JSONEncode () {}
util.inherits(JSONEncode, Command);

/**
 * Transform data into JSON strings.
 *
 * This uses JSON.stringify to convert data into a JSON string. The
 * result is then placed into the context.
 *
 * Params:
 *
 * - data: A JavaScript object that will be serialized to JSON data.
 */
JSONEncode.prototype.execute = function (cxt, params) {
	var data = params.data || {};
	this.done(JSON.stringify(data));
}