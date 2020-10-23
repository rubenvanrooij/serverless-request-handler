import { IHttpError, IErrorDetail } from './models';

export class HttpError extends Error implements IHttpError {

    public readonly statusCode: number;
    public readonly success: false;
    public readonly details: IErrorDetail[];

    constructor(statusCode: number, message?: string, ...details: IErrorDetail[]) {
        super(message);

        this.statusCode = statusCode;
        this.success = false;
        this.details = details;
    }
}
