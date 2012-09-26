var util = require('util');
var EventEmitter = require('events').EventEmitter;

exports.Logger = Logger;
exports.ConsoleLogger = ConsoleLogger;

/**
 * The logger.
 */
function Logger() {
}
util.inherits(Logger, EventEmitter)

Logger.prototype.log = function(category, message) {
  this.emit(category, category, message);
}

function ConsoleLogger(logger) {
  logger.on('warning', ConsoleLogger.write);
  logger.on('error', ConsoleLogger.write);
  logger.on('fatal', ConsoleLogger.write);
  logger.on('info', ConsoleLogger.write);
  logger.on('debug', ConsoleLogger.write);
  logger.on('custom', ConsoleLogger.write);
}

ConsoleLogger.write = function (level, msg) {
  switch (level) {
    case "error":
    case "warning":
      console.error(level + ': ' + msg);
      break;
    case "warning":
    case "info":
    case "debug":
    default:
      console.warn(level + ': ' + msg);
  }
}
