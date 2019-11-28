import winston from 'winston';

export const defaultLogger = winston.createLogger({
    exitOnError: false,
    format: winston.format.json(),
    level: 'debug',
    transports: [new winston.transports.Console()]
});
