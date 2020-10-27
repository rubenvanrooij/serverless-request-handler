import { METHOD_NOT_ALLOWED } from 'http-status-codes';
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

    public transformResponse<T>(response: IProviderResponse<T>, req: IGoogleRequest, res: IGoogleResponse): void {
        res.status(response.statusCode);
        res.set(response.headers || {});
        res.send(response.body || {});
    }

    public async trace(handler: GenericHandler): Promise<void> {
        throw new Error('Method not implemented.');
    }

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
