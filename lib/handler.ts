import { defaultLogger } from './console-logger';
import {
    HandlerOptions,
    Dictionary,
    IOk,
    GenericHandlerOptions,
    Handler,
    GenericProviderHandler,
    IProviderRequest
} from './models';
import { convertAndValidate } from './convert-and-validate';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { defaultErrorTransformer } from './default-error-transformer';
import { HttpError } from './http-error';
import { Provider } from './providers';
import winston from 'winston';

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
        eventHandler: Handler<T1, T2, T3, T4, TResponse>): GenericProviderHandler {

        const errorTransformer = options.errorTransformer || defaultErrorTransformer;
        const logger = options.logger || defaultLogger;
        const provider = selectProvider(options, logger);

        return async (...providerParams: any[]): Promise<any> => {
            try {
                const request = provider.transformRequest(...providerParams);
                const validatedRequest = await validateRequest(options, request);

                const response = await eventHandler({
                    ...validatedRequest,
                    body: request.body as T1,
                    queryParameters: request.queryParameters as T2,
                    pathParameters: request.pathParameters as T3,
                    headers: request.headers as T4,
                });

                if (response.success) {
                    const validatedResponse = await validateResponse(options, response);
                    return provider.transformResponse(validatedResponse, ...providerParams);
                }

                return provider.transformResponse(errorTransformer(response, options));
            } catch (error) {
                if (error instanceof HttpError) {
                    return provider.transformResponse(errorTransformer(error, options));
                }

                // Log unexpected errors
                logger.error(error);

                return provider.transformResponse(errorTransformer(new HttpError(
                    INTERNAL_SERVER_ERROR,
                    error.message
                ), options));
            }
        };
}

function selectProvider(options: GenericHandlerOptions, logger: winston.Logger): Provider {
    switch (process.env.PROVIDER) {
        default:
        case 'aws':
            return new (require('./providers/aws/provider')).AWSProvider(options, logger);
        case 'google':
            return new (require('./providers/google/provider')).GoogleProvider(options, logger);
    }
}

async function validateRequest(options: GenericHandlerOptions, request: IProviderRequest): Promise<IProviderRequest> {
    return {
        ...request,
        pathParameters: options.pathParameters ?
            await convertAndValidate(
                    request.pathParameters || {},
                    options.pathParameters,
                    ERROR_MESSAGES.INVALID_PATH_PARAMETERS
                ) : request.pathParameters,
        queryParameters: options.queryParameters ?
            await convertAndValidate(
                    request.queryParameters || {},
                    options.queryParameters,
                    ERROR_MESSAGES.INVALID_QUERY_PARAMETERS
                ) : request.queryParameters,
        headers: options.headers ?
            await convertAndValidate(
                    request.headers,
                    options.headers,
                    ERROR_MESSAGES.INVALID_HEADERS
                ) : request.headers,
        body: options.body ?
            await convertAndValidate(
                    request.body,
                    options.body,
                    ERROR_MESSAGES.INVALID_BODY
                ) : request.body,
    };
}

async function validateResponse<T>(options: GenericHandlerOptions, response: IOk<T>): Promise<IOk<T>> {
    return {
        ...response,
        body: options.response ?
            await convertAndValidate(
                response.body,
                options.response,
                ERROR_MESSAGES.INVALID_RESPONSE
            ) : response.body,
    };
}
