import * as googleTracing from '@google-cloud/trace-agent';
import { METHOD_NOT_ALLOWED } from 'http-status-codes';
import { TRACING_ENABLED } from '../../constants';
import { HttpError } from '../../http-error';
import { Dictionary, GenericHandler, GenericProxyEvent, IProviderRequest, IProviderResponse, ResultResponse } from '../../models';
import { Provider } from '../provider';

interface IGoogleRequest {
    method: string;
    headers: { [header: string]: boolean | number | string };
    query: Dictionary;
    params: Dictionary;
    body: { [name: string]: any };
    url: string;
}

interface IGoogleResponse {
    status(status: number): void;
    set(headers: { [header: string]: boolean | number | string }): void;
    send(body: { [name: string]: any }): void;
}

// Initialize the StackDriver trace agent.
// Maybe move this to the user to execute?
// As it might have problems tracing stuff when loaded at the time the provider is loaded.
if (TRACING_ENABLED) {
    googleTracing.start();
}

export class GoogleProvider extends Provider {
    /**
     * Transform a request from Google to an IProviderRequest.
     * @param {IGoogleRequest} req - The Google request.
     * @returns {IProviderRequest} - The transformed data.
     */
    public transformRequest(req: IGoogleRequest): IProviderRequest {
        // If a HTTP method is defined, limit execution to that method.
        if (this.options.httpMethod && this.options.httpMethod !== req.method.toUpperCase()) {
            throw new HttpError(METHOD_NOT_ALLOWED);
        }

        return {
            body: req.body,
            headers: req.headers,
            queryParameters: req.query,
            pathParameters: this.parsePathParameters(req.params),
            httpMethod: req.method.toUpperCase(),
            path: req.url,
            context: null,
        };
    }

    /**
     * Transform the response to a response Google can understand.
     * @param {IProviderResponse<T>} response - The response to transform.
     */
    public transformResponse<T>(response: IProviderResponse<T>, req: IGoogleRequest, res: IGoogleResponse): void {
        res.status(response.statusCode);
        res.set(response.headers || {});
        res.send(response.body || {});
    }

    /**
     * Trace the execution of the provided handler using StackDriver tracing.
     * @param {GenericHandler} handler - The handler to trace.
     * @param {GenericProxyEvent} event - The event to pass to the handler.
     * @returns {ResultResponse<T>} - The response of the handler.
     */
    public async trace<T>(handler: GenericHandler, event: GenericProxyEvent): ResultResponse<T> {
        return new Promise((resolve, reject) => {
            // This will create a separate trace.
            // The root span that is created from Cloud Functions doesn't seem to be accessible.
            googleTracing.get().runInRootSpan({ name: this.options.traceName! }, async (span) => {
                try {
                    const response = await handler(event);
                    span.endSpan();
                    resolve(response);
                } catch (err) {
                    this.logger.error('Error before span end', err);
                    span.endSpan();
                    reject(err);
                }
            });
        });
    }

    /**
     * The path parameters provided by Google are not mapped to a key.
     * Parse them by taking each parameter and assigning them to the key defined in the pathParameterMap.
     * @param {Dictionary} params - The parameters to parse.
     * @returns {Dictionary} - The parsed parameters.
     */
    private parsePathParameters(params: Dictionary): Dictionary {
        const parts = params['0'].split('/');
        const parameters: Dictionary = {};

        for (let i = 0; i < parts.length; i++) {
            if (this.options.pathParameterMap && this.options.pathParameterMap[i]) {
                parameters[this.options.pathParameterMap[i]] = parts[i];
            } else {
                parameters[i + ''] = parts[i];
            }
        }

        return parameters;
    }
}
