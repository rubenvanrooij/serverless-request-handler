import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as awsTracing from 'aws-xray-sdk';
import { convertToJson } from '../../convert-to-json';
import { GenericHandler, GenericProxyEvent, IProviderRequest, IProviderResponse, ResultResponse } from '../../models';
import { Provider } from '../provider';

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
    /**
     * Transform an event from AWS to an IProviderRequest.
     * @param {APIGatewayProxyEvent} event - The AWS event.
     * @returns {IProviderRequest} - The transformed data.
     */
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

    /**
     * Transform the response to a result AWS can understand.
     * @param {IProviderResponse<T>} response - The response to transform.
     * @returns {APIGatewayProxyResult} - The AWS result.
     */
    public transformResponse<T>(response: IProviderResponse<T>): APIGatewayProxyResult {
        return {
            statusCode: response.statusCode,
            body: response.body ? JSON.stringify(response.body) : '',
            headers: response.headers
        };
    }

    /**
     * Trace the execution of the provided handler using XRay.
     * @param {GenericHandler} handler - The handler to trace.
     * @param {GenericProxyEvent} event - The event to pass to the handler.
     * @returns {ResultResponse<T>} - The response of the handler.
     */
    public async trace<T>(handler: GenericHandler, event: GenericProxyEvent): ResultResponse<T> {
        return awsTracing.captureAsyncFunc(this.options.traceName!, async (segment) => {
            try {
                const response = await handler(event);
                segment?.close();
                return response;
            } catch (err) {
                this.logger.error('Error before segment close', err);
                segment?.close(err);
                throw err;
            }
        });
    }
}
