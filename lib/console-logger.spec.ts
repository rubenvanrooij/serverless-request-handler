import { defaultLogger } from './console-logger';

describe('console-logger', () => {
    it('should create a logger', () => {
        expect(defaultLogger.level).toEqual('debug');
        expect(defaultLogger.exitOnError).toEqual(false);
        expect(defaultLogger.transports.length).toEqual(1);
    });
});
