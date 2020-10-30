import { URL } from 'url';
import { Context, HttpRequest } from '@azure/functions';
import * as azureTracing from 'applicationinsights';
import { TRACING_ENABLED } from '../../constants';
import { GenericHandler, GenericProxyEvent, IProviderRequest, IProviderResponse, ResultResponse } from '../../models';
import { Provider } from '../provider';

// Initialize the Application Insights agent.
// Maybe move this to the user to execute?
// As it might have problems tracing stuff when loaded at the time the provider is loaded.
if (TRACING_ENABLED) {
    azureTracing.setup('74cf4922-6061-4880-a10f-85b466288cca').start();
}

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
        const correlationContext = azureTracing.startOperation(event.context, event.context.req);

        return new Promise(async (resolve, reject) => {
            azureTracing.wrapWithCorrelationContext(async () => {
                // Save the start time as we have to trace the duration ourselves.
                const startTime = Date.now();

                try {
                    const response = await handler(event);
                    resolve(response);
                } catch (err) {
                    azureTracing.defaultClient.trackException({ exception: err });
                    reject(err);
                }

                // We use a page view here because using a request creates a new trace.
                // With short response times the duration is not always displayed correctly in Application Insights.
                azureTracing.defaultClient.trackPageView({
                    name: this.options.traceName,
                    duration: Date.now() - startTime,
                    time: new Date(startTime)
                });
                // Immediately write the trace, this is likely to create a delay in function response time.
                // TODO: Maybe we can skip flushing as the event loop keeps running in the background?
                azureTracing.defaultClient.flush();
            }, correlationContext!)();
        });
    }
}
