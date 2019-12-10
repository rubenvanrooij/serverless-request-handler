import { defaultErrorTransformer } from './default-error-transformer';
import { HttpError } from './http-error';

describe('default-error-transformer', () => {
    it('should properly transform an error', () => {

        const error: HttpError = new HttpError(201, 'message');

        expect(defaultErrorTransformer(error, { showStackTrace: false })).toEqual({
            statusCode: 201,
            body: '{"status":201,"name":"Created","message":"message","details":[]}'
        });
    });
});
