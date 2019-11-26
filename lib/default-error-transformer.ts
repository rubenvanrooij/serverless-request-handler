import { IHttpError } from './models';
import { getStatusText } from 'http-status-codes';
import { APIGatewayProxyResult } from 'aws-lambda';

export function defaultErrorTransformer(error: IHttpError): APIGatewayProxyResult {
    return {
        statusCode: error.statusCode,
        body: JSON.stringify({
            status: error.statusCode,
            name: getStatusText(error.statusCode),
            message: error.message,
            details: error.details
        })
    };
}
