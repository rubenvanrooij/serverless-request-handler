export interface IProviderRequest {
    body: { [key: string]: any } | null;
    headers: { [header: string]: any } | null;
    queryParameters: { [param: string]: any } | null;
    pathParameters: { [param: string]: any } | null;
    // httpMethod: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
    httpMethod: string;
    path: string;
    context: any;
}
