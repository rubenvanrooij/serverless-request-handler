import { defaultErrorTransformer } from './default-error-transformer';
import { IHttpError } from './models';

describe('default-error-transformer', () => {
    it('should properly transform an error', () => {

        const error: IHttpError = {
            statusCode: 201,
            message: 'message',
            success: false,
            details: []
        };

        expect(defaultErrorTransformer(error)).toEqual({
            statusCode: 201,
            body: '{"status":201,"name":"Created","message":"message","details":[]}'
        });
    });
});
