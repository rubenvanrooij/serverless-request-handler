import { Dictionary, GenericHandler, IProviderRequest, IProviderResponse } from '../../models';
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
    public transformRequest(req: IGoogleRequest): IProviderRequest {
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
