import { HttpError } from './http-error';
describe('http-error', () => {
    it('It should correctly create an Error object', () => {
        const error = new HttpError(100);
        expect(error.message).toEqual('');
        expect(error.statusCode).toEqual(100);
        expect(error.success).toBeFalsy();
        expect(error.details).toEqual([]);
    });

    it('It should correctly create an Error object with a message', () => {
        const error = new HttpError(100, 'message');
        expect(error.message).toEqual('message');
        expect(error.statusCode).toEqual(100);
        expect(error.success).toBeFalsy();
        expect(error.details).toEqual([]);
    });

    it('It should correctly create an Error object with details', () => {

        const detail = {
            message: 'message',
            code: 0,
            name: 'name'
        };

        const error = new HttpError(100, 'message', detail, detail);
        expect(error.message).toEqual('message');
        expect(error.statusCode).toEqual(100);
        expect(error.success).toBeFalsy();
        expect(error.details).toEqual([detail, detail]);
    });
});
