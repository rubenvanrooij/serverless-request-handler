import { ValidatorOptions } from 'class-validator';
import { ClassType } from 'class-transformer/ClassTransformer';
import { APIGatewayProxyResult, APIGatewayEventRequestContext } from 'aws-lambda';
import winston from 'winston';
import { HttpError } from './http-error';

// TODO: Add required option
export interface ValidateOptions<T> {
    classType: ClassType<T>;
    options?: ValidatorOptions;
    description?: string;
}

export interface ValidateResponseOption<T> extends ValidateOptions<T> {
    statusCode: number;
}

export interface HandlerOptions<TBody, TQueryParams, TPathParameters, THeaders, TResponse> {
    body?: ValidateOptions<TBody>;
    queryParameters?: ValidateOptions<TQueryParams>;
    pathParameters?: ValidateOptions<TPathParameters>;
    headers?: ValidateOptions<THeaders>;
    response?: ValidateResponseOption<TResponse>;
    errorResponses?: Array<ValidateResponseOption<unknown>>;

    /**
     * Optional error transformer to customize the error response
     */
    errorTransformer?: (error: HttpError) => APIGatewayProxyResult;

    /**
     * Optional logger. If none is set a default console logger will be used
     */
    logger?: winston.Logger;

    /*
    * On error, allows stacktrace to be shown. By default it is false;
    */
    showStackTrace?: boolean;
}

export interface Dictionary { [name: string]: string; }

export interface ProxyEvent<TBody, TQueryParams, TPathParameters, THeaders> {
    body: TBody;
    queryParameters: TQueryParams;
    headers: THeaders;
    pathParameters: TPathParameters;
    httpMethod: string;
    path: string;
    context: APIGatewayEventRequestContext;
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

export type ResultResponse<T> = Promise<IOk<T> | HttpError>;
