import { Logger } from './models';

export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    DEBUG = 2,
    INFO = 3
}

export class ConsoleLogger implements Logger {

    constructor(public logLevel: LogLevel = LogLevel.ERROR) {}

    public error(message: string | object) {
        this.log(LogLevel.ERROR, message);
    }

    public warn(message: string | object) {
        this.log(LogLevel.WARN, message);
    }

    public info(message: string | object) {
        this.log(LogLevel.INFO, message);
    }

    public debug(message: string | object) {
        this.log(LogLevel.DEBUG, message);
    }

    private log(level: LogLevel, message: string | object): void {

        if (level > this.logLevel) {
            return;
        }

        // tslint:disable-next-line: no-console
        console.log(message);
    }

}

export const defaultLogger = new ConsoleLogger();
