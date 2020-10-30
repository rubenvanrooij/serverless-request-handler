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
import { PROVIDER, TRACING_ENABLED } from './constants';
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
        // TODO: add support for tracing the transformation and validation as separate segments.
        // TODO: add support for generating Swagger documentation based on the validation.

        const errorTransformer = options.errorTransformer || defaultErrorTransformer;
        const logger = options.logger || defaultLogger;
        const provider = selectProvider(options, logger);

        return async (...providerParams: any[]): Promise<any> => {
            try {
                // Transform and validate the request.
                const request = provider.transformRequest(...providerParams);
                const validatedRequest = await validateRequest(options, request);
                const event = {
                    ...validatedRequest,
                    body: validatedRequest.body as T1,
                    queryParameters: validatedRequest.queryParameters as T2,
                    pathParameters: validatedRequest.pathParameters as T3,
                    headers: validatedRequest.headers as T4,
                };

                // Execute the handler with optional tracing.
                let response: HttpError | IOk<TResponse>;
                if (TRACING_ENABLED && options.traceName) {
                    response = await provider.trace(eventHandler, event);
                } else {
                    response = await eventHandler(event);
                }

                if (response.success) {
                    // Validate and send the success response.
                    const validatedResponse = await validateResponse(options, response);
                    return provider.transformResponse(validatedResponse, ...providerParams);
                }

                // Send the error response.
                return provider.transformResponse(errorTransformer(response, options), ...providerParams);
            } catch (error) {
                if (error instanceof HttpError) {
                    return provider.transformResponse(errorTransformer(error, options), ...providerParams);
                }

                // Log unexpected errors
                logger.error(error);

                return provider.transformResponse(errorTransformer(new HttpError(
                    INTERNAL_SERVER_ERROR,
                    error.message
                ), options), ...providerParams);
            }
        };
}

/**
 * Select the provider to use based on the PROVIDER environment variable.
 * Will select AWS by default if none is provided.
 * @param {GenericHandlerOptions} options - The options to use for the provider instance.
 * @param {winston.Logger} logger - The logger to use for the provider instance.
 */
function selectProvider(options: GenericHandlerOptions, logger: winston.Logger): Provider {
    switch (PROVIDER) {
        default:
        case 'aws':
            return new (require('./providers/aws')).AWSProvider(options, logger);
        case 'azure':
            return new (require('./providers/azure')).AzureProvider(options, logger);
        case 'google':
            return new (require('./providers/google')).GoogleProvider(options, logger);
    }
}

/**
 * Validate and convert an incoming request based on the provided handler options.
 * @param {GenericHandlerOptions} options - The options to use for validating.
 * @param {IProviderRequest} request - The data to validate.
 * @returns {IProviderRequest} - The validated and converted data.
 */
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

/**
 * Validate and convert a response based on the provided handler options.
 * @param {GenericHandlerOptions} options - The options to use for validating.
 * @param {IOk<T>} response - The data to validate.
 * @returns {IOk<T>} - The validated and converted data.
 */
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
