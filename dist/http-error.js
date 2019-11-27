"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
    constructor(statusCode, message, ...details) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.details = details;
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=http-error.js.map