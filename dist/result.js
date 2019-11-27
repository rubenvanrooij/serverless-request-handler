"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Result {
    static Ok(statusCode, body, headers) {
        return {
            success: true,
            statusCode,
            body,
            headers
        };
    }
    static Error(statusCode, message, ...details) {
        return {
            success: false,
            statusCode,
            message,
            details
        };
    }
}
exports.Result = Result;
//# sourceMappingURL=result.js.map