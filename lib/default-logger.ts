import { Logger } from './models';

export const defaultLogger: Logger = {
    // tslint:disable: no-console
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug
    // tslint:enable: no-console
};
