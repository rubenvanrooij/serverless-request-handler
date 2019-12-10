import { getStatusText } from 'http-status-codes';
import { APIGatewayProxyResult } from 'aws-lambda';
import { HttpError } from './http-error';

export function defaultErrorTransformer(error: HttpError,
                                        options: { showStackTrace?: boolean }): APIGatewayProxyResult {

    const stackTraceDetails = options.showStackTrace ? [{
        name: 'Unexpected Error',
        message: error.stack
    }] : [];

    return {
        statusCode: error.statusCode,
        body: JSON.stringify({
            status: error.statusCode,
            name: getStatusText(error.statusCode),
            message: error.message,
            details: [
                ...error.details,
                ...stackTraceDetails
            ]
        })
    };
}
