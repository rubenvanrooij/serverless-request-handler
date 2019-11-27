"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const http_error_1 = require("./http-error");
function convertToJson(value, logger) {
    try {
        return JSON.parse(value || '');
    }
    catch (error) {
        if (logger) {
            logger.error(error);
        }
        throw new http_error_1.HttpError(http_status_codes_1.BAD_REQUEST, 'Invalid json');
    }
}
exports.convertToJson = convertToJson;
//# sourceMappingURL=convert-to-json.js.map