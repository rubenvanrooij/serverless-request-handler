import { ValidatorOptions } from 'class-validator';
import { ClassType } from 'class-transformer/ClassTransformer';
import { APIGatewayProxyResult } from 'aws-lambda';

export interface ValidateOptions<T> {
    classType: ClassType<T>;
    options?: ValidatorOptions;
    description?: string;
}

type LogMethod = (message: string | object) => void;

export interface Logger {
    error: LogMethod;
    warn: LogMethod;
    info: LogMethod;
    debug: LogMethod;
}

export interface HandlerOptions<TBody, TQueryParams, TPathParameters, THeaders, TResponse> {
    body?: ValidateOptions<TBody>;
    queryParameters?: ValidateOptions<TQueryParams>;
    pathParameters?: ValidateOptions<TPathParameters>;
    headers?: ValidateOptions<THeaders>;
    response?: ValidateOptions<TResponse>;

    /**
     * Optional error transformer to customize the error response
     */
    errorTransformer?: (error: IHttpError) => APIGatewayProxyResult;

    /**
     * Optional logger. If none is set a default console logger will be used
     */
    logger?: Logger;
}

export interface ProxyEvent<TBody, TQueryParams, TPathParameters, THeaders> {
    body: TBody extends never ? any : TBody;
    queryParameters: TQueryParams extends never ? any : TQueryParams;
    headers: THeaders extends never ? any : THeaders;
    pathParameters: TPathParameters extends never ? any : TPathParameters;
    httpMethod: string;
    path: string;
}

export interface IOk<T> {
    success: true;
    statusCode: number;
    body?: T;
    headers?: { [header: string]: boolean | number | string; };
}

export interface IErrorDetail {
    message?: string | string[];
    code?: number;
    name: string;
}

export interface IHttpError {
    statusCode: number;
    message?: string;
    success: false;
    details: IErrorDetail[];
}

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

export type ResultResponse<T> = Promise<IOk<T> | IHttpError>;
