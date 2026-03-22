"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.httpLoggerStream = exports.logger = void 0;
exports.createChildLogger = createChildLogger;
var winston = require("winston");
var env_1 = require("../config/env");
/**
 * Custom log format for structured JSON logging
 */
var jsonFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), winston.format.errors({ stack: true }), winston.format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'service'],
}), winston.format.json());
/**
 * Development-friendly console format
 */
var consoleFormat = winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: 'HH:mm:ss.SSS' }), winston.format.printf(function (_a) {
    var timestamp = _a.timestamp, level = _a.level, message = _a.message, meta = __rest(_a, ["timestamp", "level", "message"]);
    var metaStr = Object.keys(meta).length ? "\n".concat(JSON.stringify(meta, null, 2)) : '';
    return "".concat(timestamp, " [").concat(level, "]: ").concat(message).concat(metaStr);
}));
/**
 * Winston logger instance
 * Provides structured logging across the application
 */
exports.logger = winston.createLogger({
    level: env_1.env.LOG_LEVEL,
    format: jsonFormat,
    defaultMeta: {
        service: 'vehicle-contact-api',
        environment: env_1.env.NODE_ENV,
    },
    transports: [
        // Console transport
        new winston.transports.Console({
            format: env_1.isDevelopment ? consoleFormat : jsonFormat,
        }),
    ],
    // Don't exit on uncaught exceptions
    exitOnError: false,
});
/**
 * Stream for Morgan HTTP logger
 */
exports.httpLoggerStream = {
    write: function (message) {
        exports.logger.info(message.trim());
    },
};
/**
 * Logger methods with context support
 */
exports.log = {
    /**
     * Log error with optional error object and metadata
     */
    error: function (message, error, meta) {
        var errorMeta = __assign({}, meta);
        if (error instanceof Error) {
            errorMeta.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }
        else if (error) {
            errorMeta.error = error;
        }
        exports.logger.error(message, errorMeta);
    },
    /**
     * Log warning with metadata
     */
    warn: function (message, meta) {
        exports.logger.warn(message, meta);
    },
    /**
     * Log info with metadata
     */
    info: function (message, meta) {
        exports.logger.info(message, meta);
    },
    /**
     * Log debug with metadata (only in development)
     */
    debug: function (message, meta) {
        exports.logger.debug(message, meta);
    },
    /**
     * Log HTTP request
     */
    http: function (message, meta) {
        exports.logger.http(message, meta);
    },
};
/**
 * Create a child logger with additional context
 * Useful for module-specific logging
 */
function createChildLogger(context) {
    var childLogger = exports.logger.child(context);
    return {
        error: function (message, error, meta) {
            var errorMeta = __assign({}, meta);
            if (error instanceof Error) {
                errorMeta.error = {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                };
            }
            else if (error) {
                errorMeta.error = error;
            }
            childLogger.error(message, errorMeta);
        },
        warn: function (message, meta) { return childLogger.warn(message, meta); },
        info: function (message, meta) { return childLogger.info(message, meta); },
        debug: function (message, meta) { return childLogger.debug(message, meta); },
        http: function (message, meta) { return childLogger.http(message, meta); },
    };
}
exports.default = exports.logger;
