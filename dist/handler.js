"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const console_logger_1 = require("./console-logger");
const convert_and_validate_1 = require("./convert-and-validate");
const http_status_codes_1 = require("http-status-codes");
const convert_to_json_1 = require("./convert-to-json");
const default_error_transformer_1 = require("./default-error-transformer");
const http_error_1 = require("./http-error");
const ERROR_MESSAGES = {
    INVALID_BODY: 'Invalid body',
    INVALID_QUERY_PARAMETERS: 'Invalid query parameters',
    INVALID_PATH_PARAMETERS: 'Invalid path parameters',
    INVALID_HEADERS: 'Invalid headers',
    INVALID_RESPONSE: 'Invalid response'
};
function handler(options, eventHandler) {
    const errorTransformer = options.errorTransformer || default_error_transformer_1.defaultErrorTransformer;
    const logger = options.logger || console_logger_1.defaultLogger;
    return async (proxyEvent) => {
        try {
            const pathParameters = options.pathParameters ?
                await convert_and_validate_1.convertAndValidate(proxyEvent.pathParameters || {}, options.pathParameters, ERROR_MESSAGES.INVALID_PATH_PARAMETERS) : proxyEvent.pathParameters;
            const queryParameters = options.queryParameters ?
                await convert_and_validate_1.convertAndValidate(proxyEvent.queryStringParameters || {}, options.queryParameters, ERROR_MESSAGES.INVALID_QUERY_PARAMETERS) : proxyEvent.queryStringParameters;
            const headers = options.headers ?
                await convert_and_validate_1.convertAndValidate(proxyEvent.headers, options.headers, ERROR_MESSAGES.INVALID_HEADERS) : proxyEvent.headers;
            const body = options.body ?
                await convert_and_validate_1.convertAndValidate(convert_to_json_1.convertToJson(proxyEvent.body, logger), options.body, ERROR_MESSAGES.INVALID_BODY) : proxyEvent.body;
            const result = await eventHandler({
                body: body,
                queryParameters: queryParameters,
                pathParameters: pathParameters,
                headers: headers,
                httpMethod: proxyEvent.httpMethod,
                path: proxyEvent.path
            });
            if (result.success) {
                const validatedBody = options.response ?
                    await convert_and_validate_1.convertAndValidate(result.body, options.response, ERROR_MESSAGES.INVALID_RESPONSE) : result.body;
                return {
                    statusCode: result.statusCode,
                    body: validatedBody ? JSON.stringify(validatedBody) : '',
                    headers: result.headers
                };
            }
            return errorTransformer(result);
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError) {
                return errorTransformer(error);
            }
            // Log unexpected errors
            logger.error(error);
            return errorTransformer({
                statusCode: http_status_codes_1.INTERNAL_SERVER_ERROR,
                success: false,
                details: []
            });
        }
    };
}
exports.handler = handler;
//# sourceMappingURL=handler.js.map