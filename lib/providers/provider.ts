import winston from 'winston';
import { GenericHandler, GenericHandlerOptions, IProviderRequest, IProviderResponse } from '../models';

export abstract class Provider {
    protected options: GenericHandlerOptions;
    protected logger: winston.Logger;

    constructor(options: GenericHandlerOptions, logger: winston.Logger) {
        this.options = options;
        this.logger = logger;
    }

    public abstract transformRequest(...providerParams: any): IProviderRequest;
    public abstract transformResponse<T>(response: IProviderResponse<T>, ...providerParams: any): any;
    public abstract async trace(handler: GenericHandler): Promise<void>;
}
