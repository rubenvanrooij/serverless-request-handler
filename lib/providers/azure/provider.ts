import { URL } from 'url';
import { Context, HttpRequest } from '@azure/functions';
import { GenericHandler, GenericProxyEvent, IProviderRequest, IProviderResponse, ResultResponse } from '../../models';
import { Provider } from '../provider';

export class AzureProvider extends Provider {
    /**
     * Transform a request from Azure to an IProviderRequest.
     * @param {Context} ctx - The Azure context.
     * @param {HttpRequest} req - The Azure request.
     * @returns {IProviderRequest} - The transformed data.
     */
    public transformRequest(ctx: Context, req: HttpRequest): IProviderRequest {
        return {
            body: req.body || null,
            headers: req.headers,
            queryParameters: req.query,
            pathParameters: req.params,
            httpMethod: req.method?.toUpperCase() || 'UNKNOWN',
            path: new URL(req.url).pathname,
            context: ctx,
        };
    }

    /**
     * Transform the response to a result Azure can understand.
     * @param {IProviderResponse<T>} response - The response to transform.
     */
    public transformResponse<T>(response: IProviderResponse<T>, ctx: Context): void {
        // Set content type as JSON by default.
        response.headers = response.headers || {};
        response.headers['Content-Type'] = response.headers['Content-Type'] || 'application/json';

        ctx.res = {
            status: response.statusCode,
            headers: response.headers,
            body: response.body,
        };
    }

    /**
     * Trace the execution of the provided handler using Azure tracing.
     * @param {GenericHandler} handler - The handler to trace.
     * @param {GenericProxyEvent} event - The event to pass to the handler.
     * @returns {ResultResponse<T>} - The response of the handler.
     */
    public async trace<T>(handler: GenericHandler, event: GenericProxyEvent): ResultResponse<T> {
        throw new Error('Not implemented');
    }
}
