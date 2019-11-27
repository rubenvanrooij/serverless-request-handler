import { defaultLogger } from './console-logger';
import { HandlerOptions, ProxyEvent, ResultResponse, Dictionary } from './models';
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { convertAndValidate } from './convert-and-validate';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { convertToJson } from './convert-to-json';
import { defaultErrorTransformer } from './default-error-transformer';
import { HttpError } from './http-error';

const ERROR_MESSAGES = {
    INVALID_BODY: 'Invalid body',
    INVALID_QUERY_PARAMETERS: 'Invalid query parameters',
    INVALID_PATH_PARAMETERS: 'Invalid path parameters',
    INVALID_HEADERS: 'Invalid headers',
    INVALID_RESPONSE: 'Invalid response'
};

export function handler<
    T1 = string | null,
    T2 = Dictionary | null,
    T3 = Dictionary | null,
    T4 = Dictionary | null,
    TResponse = unknown>(
        options: HandlerOptions<T1, T2, T3, T4, TResponse>,
        eventHandler: (event: ProxyEvent<T1, T2, T3, T4>) => ResultResponse<TResponse>): APIGatewayProxyHandler {

        const errorTransformer = options.errorTransformer || defaultErrorTransformer;
        const logger = options.logger || defaultLogger;

        return async (proxyEvent: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

            try {

                const pathParameters = options.pathParameters ?
                    await convertAndValidate(
                            proxyEvent.pathParameters || {},
                            options.pathParameters,
                            ERROR_MESSAGES.INVALID_PATH_PARAMETERS
                        ) : proxyEvent.pathParameters;

                const queryParameters = options.queryParameters ?
                    await convertAndValidate(
                            proxyEvent.queryStringParameters || {},
                            options.queryParameters,
                            ERROR_MESSAGES.INVALID_QUERY_PARAMETERS
                        ) : proxyEvent.queryStringParameters;

                const headers = options.headers ?
                    await convertAndValidate(
                            proxyEvent.headers,
                            options.headers,
                            ERROR_MESSAGES.INVALID_HEADERS
                        ) : proxyEvent.headers;

                const body = options.body ?
                    await convertAndValidate(
                            convertToJson(proxyEvent.body, logger),
                            options.body,
                            ERROR_MESSAGES.INVALID_BODY
                        ) : proxyEvent.body;

                const result = await eventHandler({
                    body: body as T1,
                    queryParameters: queryParameters as T2,
                    pathParameters: pathParameters as T3,
                    headers: headers as T4,
                    httpMethod: proxyEvent.httpMethod,
                    path: proxyEvent.path
                });

                if (result.success) {

                    const validatedBody = options.response ?
                        await convertAndValidate(
                            result.body,
                            options.response,
                            ERROR_MESSAGES.INVALID_RESPONSE
                        ) : result.body;

                    return {
                        statusCode: result.statusCode,
                        body: validatedBody ? JSON.stringify(validatedBody) : '',
                        headers: result.headers
                    };
                }

                return errorTransformer(result);
            } catch (error) {

                if (error instanceof HttpError) {
                    return errorTransformer(error);
                }

                // Log unexpected errors
                logger.error(error);

                return errorTransformer({
                    statusCode: INTERNAL_SERVER_ERROR,
                    success: false,
                    details: []
                });
            }
        };
}
