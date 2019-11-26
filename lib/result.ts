import { IOk, IErrorDetail, IHttpError } from '.';

export class Result {
    public static Ok<T>(statusCode: number,
                        body?: T,
                        headers?: { [header: string]: boolean | number | string; }): IOk<T> {
        return {
            success: true,
            statusCode,
            body,
            headers
        };
    }

    public static Error(statusCode: number, message?: string, ...details: IErrorDetail[]): IHttpError {
        return {
            success: false,
            statusCode,
            message,
            details
        };
    }
}
