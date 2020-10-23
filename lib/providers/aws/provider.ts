import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { convertToJson } from '../../convert-to-json';
import { IOk } from '../../models';
import { Provider } from '../provider';
import { IProviderRequest } from '../provider-request.interface';

// export interface IAWSEvent {
//     body: string | null;
//     headers: { [header: string]: string };
//     multiValueHeaders: { [header: string]: string[] };
//     httpMethod: string;
//     isBase64Encoded: boolean;
//     path: string;
//     pathParameters: { [param: string]: string } | null;
//     queryStringParameters: { [param: string]: string } | null;
//     multiValueQueryStringParameters: { [param: string]: string[] } | null;
//     stageVariables: { [name: string]: string } | null;
//     resource: string;
//     requestContext: any;
// }

// interface IAWSResponse {
//     statusCode: number;
//     headers?: { [header: string]: boolean | number | string };
//     multiValueHeaders?: { [header: string]: Array<boolean | number | string> };
//     body: string;
//     isBase64Encoded?: boolean;
// }

export class AWSProvider extends Provider {
    public transformRequest(event: APIGatewayProxyEvent): IProviderRequest {
        return {
            body: event.body !== null ? convertToJson(event.body, this.logger) : null,
            headers: event.headers,
            queryParameters: event.queryStringParameters,
            pathParameters: event.pathParameters,
            httpMethod: event.httpMethod.toUpperCase(),
            path: event.path,
            context: event.requestContext,
        };
    }

    public transformResponse<T>(response: IOk<T>): APIGatewayProxyResult {
        return {
            statusCode: response.statusCode,
            body: response.body ? JSON.stringify(response.body) : '',
            headers: response.headers
        };
    }

    public trace(handler: any): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
