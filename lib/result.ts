import { IOk, IErrorDetail, HttpError } from '.';

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

    public static Error(statusCode: number, message?: string, ...details: IErrorDetail[]): HttpError {
        return new HttpError(
            statusCode,
            message,
            ...details
        );
    }
}
