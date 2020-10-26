import { GenericHandler, IProviderRequest, IProviderResponse } from '../../models';
import { Provider } from '../provider';

interface IGoogleRequest {
    method: string;
    headers: { [header: string]: boolean | number | string };
    query: { [param: string]: string };
    params: { [param: string]: string };
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
            pathParameters: req.params,
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
}
