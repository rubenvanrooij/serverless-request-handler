import { ConsoleLogger, LogLevel } from './console-logger';

describe('console-logger', () => {
    it('should only log the correct log level', () => {
        const logger = new ConsoleLogger();
        const consoleLogMock = jest.fn();

        // tslint:disable-next-line: no-console
        console.log = consoleLogMock;

        const tests = [
            {
                level: LogLevel.INFO,
                output: ['INFO', 'DEBUG', 'WARN', 'ERROR']
            }, {
                level: LogLevel.DEBUG,
                output: ['DEBUG', 'WARN', 'ERROR']
            }, {
                level: LogLevel.WARN,
                output: ['WARN', 'ERROR']
            }, {
                level: LogLevel.ERROR,
                output: ['ERROR']
            }
        ];

        tests.forEach((test) => {

            consoleLogMock.mockReset();

            logger.logLevel = test.level;
            logger.info('INFO');
            logger.debug('DEBUG');
            logger.warn('WARN');
            logger.error('ERROR');

            test.output.forEach((output, index) => {
                expect(consoleLogMock).toHaveBeenNthCalledWith(index + 1, output);
            });

        });
    });
});
