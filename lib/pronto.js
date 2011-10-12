

// Local packages
var Context = require('./context');
var CommandList = require('./commandlist');
var Command = require('./command');
var Registry = require('./registry');
var Router = require('./router');
var HTTPServer = require('./httpserver');

// Export local classes.
exports.Context = Context;
exports.CommandList = CommandList;
exports.Command = Command;
exports.Router = Router;
exports.Registry = exports.register = Registry;
exports.HTTPServer = HTTPServer;

// Export utilities.
exports.inheritsCommand = inheritsCommand;

// Define utilities

var util = require('util');

/**
 * Endows the new object with the prototype for commands.
 *
 * This is basically a convenience form of util.inherits(newObject, parent).
 */
function inheritsCommand(newObject) {
	return util.inherits(newObject, Command);
}