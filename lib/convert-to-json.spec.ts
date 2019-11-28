import { BAD_REQUEST } from 'http-status-codes';
import { HttpError } from './http-error';
import { convertToJson } from './convert-to-json';
import winston from 'winston';

describe('convert-to-json', () => {
    it('should throw an error when invalid json is provided', () => {
        expect(() => convertToJson()).toThrow(new HttpError(BAD_REQUEST, 'Invalid json'));
        expect(() => convertToJson('')).toThrow(new HttpError(BAD_REQUEST, 'Invalid json'));
        expect(() => convertToJson('}')).toThrow(new HttpError(BAD_REQUEST, 'Invalid json'));
        expect(() => convertToJson('{ foo: bar }')).toThrow(new HttpError(BAD_REQUEST, 'Invalid json'));
    });

    it('should log the error when a logger is provided', () => {

        const mockLogger = {
            error: jest.fn()
        };

        expect(() => convertToJson('', mockLogger as any as winston.Logger))
            .toThrow(new HttpError(BAD_REQUEST, 'Invalid json'));

        expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });

    it('should succesfully parse json', () => {
        expect(convertToJson('{ "foo": "bar" }')).toEqual({
            foo: 'bar'
        });
    });
});
