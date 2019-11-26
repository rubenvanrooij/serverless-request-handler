import { defaultLogger } from './default-logger';
import { HandlerOptions, ProxyEvent, HttpError, ResultResponse } from './models';
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { convertAndValidate, validateOrThrow } from './convert-and-validate';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { convertToJson } from './convert-to-json';
import { defaultErrorTransformer } from './default-error-transformer';

export function handler<T1 = never, T2 = never, T3 = never, T4 = never, TResponse = unknown>(
    options: HandlerOptions<T1, T2, T3, T4, TResponse>,
    eventHandler: (event: ProxyEvent<T1, T2, T3, T4>) => ResultResponse<TResponse>): APIGatewayProxyHandler {

        const errorTransformer = options.errorTransformer || defaultErrorTransformer;
        const logger = options.logger || defaultLogger;

        return async (proxyEvent: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

            try {

                const body = options.body ?
                    await convertAndValidate(
                        convertToJson(proxyEvent.body, logger), options.body) : proxyEvent.body;

                const queryParameters = options.queryParameters ?
                    await convertAndValidate(proxyEvent.queryStringParameters || {}, options.queryParameters) :
                    proxyEvent.queryStringParameters;

                const pathParameters = options.pathParameters ?
                    await convertAndValidate(proxyEvent.pathParameters || {}, options.pathParameters) :
                    proxyEvent.pathParameters;

                const headers = options.headers ?
                    await convertAndValidate(proxyEvent.headers || {}, options.headers) :
                    proxyEvent.headers;

                const result = await eventHandler({
                    body: body as any,
                    queryParameters: queryParameters as any,
                    pathParameters: pathParameters as any,
                    headers: headers as any,
                    httpMethod: proxyEvent.httpMethod,
                    path: proxyEvent.path
                });

                if (result.success) {

                    const validatedBody = options.response ?
                        await validateOrThrow(result.body, options.response.options) : result.body;

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
