import { Result } from './result';
describe('result', () => {
    it('It should correctly create an OK result', () => {
        expect(Result.Ok(100)).toEqual({
            success: true,
            statusCode: 100
        });
    });

    it('It should correctly create an OK result with a body', () => {
        expect(Result.Ok(100, '')).toEqual({
            success: true,
            statusCode: 100,
            body: ''
        });
    });

    it('It should correctly create an OK result with custom headers', () => {
        expect(Result.Ok(100, '', { foo: 'bar' })).toEqual({
            success: true,
            statusCode: 100,
            body: '',
            headers: { foo: 'bar' }
        });
    });

    it('It should correctly create an Error result', () => {
        expect(Result.Error(100)).toEqual({
            success: false,
            statusCode: 100,
            details: []
        });
    });

    it('It should correctly create an Error result with a message', () => {
        expect(Result.Error(101, 'message')).toEqual({
            success: false,
            statusCode: 101,
            message: 'message',
            details: []
        });
    });

    it('It should correctly create an Error result with details', () => {

        const detail = {
            message: 'message',
            code: 0,
            name: 'name'
        };

        expect(Result.Error(102, 'message', detail, detail)).toEqual({
            success: false,
            statusCode: 102,
            message: 'message',
            details: [detail, detail]
        });
    });
});
