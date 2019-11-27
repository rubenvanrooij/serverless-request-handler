"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
function defaultErrorTransformer(error) {
    return {
        statusCode: error.statusCode,
        body: JSON.stringify({
            status: error.statusCode,
            name: http_status_codes_1.getStatusText(error.statusCode),
            message: error.message,
            details: error.details
        })
    };
}
exports.defaultErrorTransformer = defaultErrorTransformer;
//# sourceMappingURL=default-error-transformer.js.map