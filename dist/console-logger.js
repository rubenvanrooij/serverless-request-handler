"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["DEBUG"] = 2] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 3] = "INFO";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class ConsoleLogger {
    constructor(logLevel = LogLevel.ERROR) {
        this.logLevel = logLevel;
    }
    error(message) {
        this.log(LogLevel.ERROR, message);
    }
    warn(message) {
        this.log(LogLevel.WARN, message);
    }
    info(message) {
        this.log(LogLevel.INFO, message);
    }
    debug(message) {
        this.log(LogLevel.DEBUG, message);
    }
    log(level, message) {
        if (level > this.logLevel) {
            return;
        }
        // tslint:disable-next-line: no-console
        console.log(message);
    }
}
exports.ConsoleLogger = ConsoleLogger;
exports.defaultLogger = new ConsoleLogger();
//# sourceMappingURL=console-logger.js.map