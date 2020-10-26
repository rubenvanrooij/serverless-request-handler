import { getStatusText } from 'http-status-codes';
import { HttpError } from './http-error';
import { IError, IProviderResponse } from './models';

export function defaultErrorTransformer(error: HttpError,
                                        options: { showStackTrace?: boolean }): IProviderResponse<IError> {

    const stackTraceDetails = options.showStackTrace ? [{
        name: 'Unexpected Error',
        message: error.stack
    }] : [];

    return {
        success: false,
        statusCode: error.statusCode,
        body: {
            status: error.statusCode,
            name: getStatusText(error.statusCode),
            message: error.message,
            details: [
                ...error.details,
                ...stackTraceDetails
            ]
        }
    };
}
