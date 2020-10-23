import { Logger } from 'winston';
import { GenericHandlerOptions, IOk } from '../models';
import { IProviderRequest } from './provider-request.interface';

export abstract class Provider {
    protected options: GenericHandlerOptions;
    protected logger: Logger;

    constructor(options: GenericHandlerOptions, logger: Logger) {
        this.options = options;
        this.logger = logger;
    }

    public abstract transformRequest(...providerParams: any): IProviderRequest;
    public abstract transformResponse<T>(response: IOk<T>, ...providerParams: any): any;
    public abstract trace(handler: any): Promise<void>;
}
