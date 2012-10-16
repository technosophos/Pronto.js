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

function ConsoleLogger(logger, options) {
  options = options || { colors: false };

  var f = options.facilities || ['warning', 'error', 'fatal', 'info', 'debug', 'access', 'custom'];

  for (var i = 0; i < f.length; ++i) {
    logger.on(f[i], function (lvl, msg) {
      ConsoleLogger.write(options, lvl, msg);
    });
  }
}

ConsoleLogger.colors = {
  access: '\033[00;32m%s\033[0m %s',

  info: '\033[00;33m%s\033[0m %s',
  custom: '\033[00;33m%s\033[0m %s',

  warning: '\033[00;31m%s\033[0m %s',
  error: '\033[00;31m%s\033[0m %s',
  fatal: '\033[00;31m%s\033[0m %s',

  debug: '\033[00;36m%s\033[0m %s',
}
ConsoleLogger.defaultTemplate = "%s: %s";

ConsoleLogger.write = function (options, level, msg) {
  var tpl = ConsoleLogger.defaultTemplate;

  // Override for color console.
  if (options.colors && ConsoleLogger.colors[level]) {
    tpl = ConsoleLogger.colors[level];
  }

  switch (level) {
    case "fatal":
    case "error":
    case "warning":
      console.error(tpl, level, msg);
      break;
    case "access":
    case "custom":
    case "info":
    case "debug":
    default:
      console.warn(tpl, level, msg);
  }
}
