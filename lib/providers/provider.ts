import winston from 'winston';
import {
    GenericHandler,
    GenericHandlerOptions,
    GenericProxyEvent,
    IProviderRequest,
    IProviderResponse,
    ResultResponse
} from '../models';

export abstract class Provider {
    protected options: GenericHandlerOptions;
    protected logger: winston.Logger;

    constructor(options: GenericHandlerOptions, logger: winston.Logger) {
        this.options = options;
        this.logger = logger;
    }

    public abstract transformRequest(...providerParams: any): IProviderRequest;
    public abstract transformResponse<T>(response: IProviderResponse<T>, ...providerParams: any): any;
    public abstract async trace<T>(handler: GenericHandler, event: GenericProxyEvent): ResultResponse<T>;
}
