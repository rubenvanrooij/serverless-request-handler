import { ValidatorOptions } from 'class-validator';
import { ClassType } from 'class-transformer/ClassTransformer';
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
    errorTransformer?: (error: HttpError) => IProviderResponse<IError>;

    /**
     * Optional logger. If none is set a default console logger will be used
     */
    logger?: winston.Logger;

    /*
    * On error, allows stacktrace to be shown. By default it is false;
    */
    showStackTrace?: boolean;

    httpMethod?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
    pathParameterMap?: string[];
}

export interface GenericHandlerOptions extends HandlerOptions<any, any, any, any, any> {}

export interface Dictionary { [name: string]: string; }

export interface ProxyEvent<TBody, TQueryParams, TPathParameters, THeaders> {
    body: TBody;
    queryParameters: TQueryParams;
    headers: THeaders;
    pathParameters: TPathParameters;
    httpMethod: string;
    path: string;
    // context: APIGatewayEventRequestContext;
    context: any;
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

export interface IError {
    status: number;
    name: string;
    message: string;
    details: IErrorDetail[];
}

export type ResultResponse<T> = Promise<IOk<T> | HttpError>;

export interface IProviderRequest {
    body: { [key: string]: any } | null;
    headers: { [header: string]: any } | null;
    queryParameters: { [param: string]: any } | null;
    pathParameters: { [param: string]: any } | null;
    // httpMethod: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
    httpMethod: string;
    path: string;
    context: any;
}

export interface IProviderResponse<T> {
    success: boolean;
    statusCode: number;
    body?: T;
    headers?: { [header: string]: boolean | number | string };
}

export type GenericProviderHandler = (...providerParams: any[]) => Promise<any>;

export type Handler<T1, T2, T3, T4, TResponse> = (event: ProxyEvent<T1, T2, T3, T4>) => ResultResponse<TResponse>;

export type GenericHandler = Handler<any, any, any, any, any>;
