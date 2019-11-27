import { BAD_REQUEST } from 'http-status-codes';
import { Logger } from './models';
import { HttpError } from './http-error';

export function convertToJson(value?: string | null, logger?: Logger): any {
    try {
        return JSON.parse(value || '');
    } catch (error) {

        if (logger) {
            logger.error(error);
        }

        throw new HttpError(BAD_REQUEST, 'Invalid json');
    }
}
