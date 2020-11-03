import { APIGatewayProxyEvent, APIGatewayEventRequestContext, Context, APIGatewayProxyHandler,
         APIGatewayProxyResult } from 'aws-lambda';
import { Result } from './result';
import { IsString, IsNumber } from 'class-validator';
import { handler } from './handler';
import { OK } from 'http-status-codes';

const BASE_EVENT: APIGatewayProxyEvent = {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'HTTP_METHOD',
    isBase64Encoded: false,
    path: 'PATH',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: null as any as APIGatewayEventRequestContext,
    resource: 'RESOURCE'
};
const CONTEXT: Context = {} as unknown as Context;

async function callHandler(fn: APIGatewayProxyHandler, event: Partial<APIGatewayProxyEvent> = {}) {
    return fn({  ...BASE_EVENT, ...event }, CONTEXT , () => { return; });
}

class DummyStringClass {

    @IsString()
    public shouldBeString: string;

    constructor(value: string) {
        this.shouldBeString = value;
    }
}

// tslint:disable-next-line: max-classes-per-file
class DummyNumberClass {

    @IsNumber()
    public shouldBeNumber: number;

    constructor(value: number) {
        this.shouldBeNumber = value;
    }
}

describe('handler', () => {
    it('should be able to succesfully validate request properties', async () => {

        const PROPERTIES = [
            'pathParameters',
            'queryParameters',
            'body',
            'headers'
        ];

        for (const property of PROPERTIES) {
            const options = {
                [property]: {
                    classType: DummyStringClass
                }
            };

            const handle = handler(options, async (event: any) => {
                expect(event[property]).toEqual(new DummyStringClass('STRING'));
                expect(event[property] instanceof DummyStringClass).toBeTruthy();
                return Result.Ok(OK);
            });

            const result = await callHandler(handle, {
                queryStringParameters: { shouldBeString: 'STRING' },
                body: JSON.stringify({ shouldBeString: 'STRING' }),
                pathParameters: { shouldBeString: 'STRING' },
                headers: { shouldBeString: 'STRING' }
            });

            expect(result).toEqual({
                statusCode: OK,
                body: ''
            });
        }
    });

    it('should throw an error when a request property cannot be validated', async () => {

        const TESTS = [
            ['pathParameters', 'Invalid path parameters'],
            ['queryParameters', 'Invalid query parameters'],
            ['body', 'Invalid body'],
            ['headers', 'Invalid headers'],
        ];

        for (const [property, errorMessage] of TESTS) {
            const options = {
                [property]: {
                    classType: DummyStringClass
                }
            };

            const handle = handler(options, async () => {
                return Result.Ok(OK);
            });

            const result = await callHandler(handle, {
                queryStringParameters: null,
                body: JSON.stringify({ shouldBeNumber: 'STRING' }),
                pathParameters: null,
                headers: { shouldBeNumber: 'STRING' }
            }) as APIGatewayProxyResult;

            expect(result.statusCode).toEqual(400);
            expect(JSON.parse(result.body).message).toEqual(errorMessage);
            expect(JSON.parse(result.body).details.length > 0).toBeTruthy();
        }
    });

    it('should correctly transform an error result', async () => {
        const handle = handler({}, async () => {
            return Result.Error(301);
        });

        const result = await callHandler(handle) as APIGatewayProxyResult;
        expect(result.statusCode).toEqual(301);
        const body = JSON.parse(result.body);
        expect(body).toEqual({
            details: [],
            message: '',
            name: 'Moved Permanently',
            status: 301
        });
    });

    it('should catch any unexpected error when showStackTrace is enabled', async () => {
        const errorMessage = 'UNEXPECTED_ERROR';
        const handle = handler({
            showStackTrace: true
        }, async () => {
            throw new Error(errorMessage);
        });

        const result = await callHandler(handle) as APIGatewayProxyResult;
        expect(result.statusCode).toEqual(500);
        const resultBodyObject = JSON.parse(result.body);
        expect(resultBodyObject.name).toBe('Server Error');
        expect(resultBodyObject.message).toBe(errorMessage);
        expect(resultBodyObject.status).toBe(500);
        expect(resultBodyObject.details.length).toBe(1);
        expect(resultBodyObject.details[0].name).toBe('Unexpected Error');
        expect(resultBodyObject.details[0].message.includes(errorMessage)).toBe(true);
    });

    it('should be able to succesfully transform and validate a response', async () => {

        const options = {
            response: {
                classType: DummyStringClass,
                statusCode: 200,
                options: { whitelist: true }
            }
        };

        const handle = handler(options, async () => {
            return Result.Ok(OK, { shouldBeString: 'STRING', nonExit: 'DOES_NOT_EXIST' });
        });

        const result = await callHandler(handle) as APIGatewayProxyResult;
        expect(result.statusCode).toEqual(200);
        expect(JSON.parse(result.body)).toEqual({
            shouldBeString: 'STRING'
        });
    });

    it('should return an error response when response validation fails', async () => {

        const options = {
            response: {
                classType: DummyStringClass,
                statusCode: 200,
                options: { whitelist: true }
            }
        };

        const handle = handler(options, async () => {
            return Result.Ok(OK, { shouldBeString: 123 } as unknown as DummyStringClass);
        });

        const result = await callHandler(handle) as APIGatewayProxyResult;
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.body).message).toEqual('Invalid response');
    });

    it('should select the correct provider', async () => {
        // tslint:disable-next-line: variable-name
        const AWSProvider = jest.fn();
        jest.mock('./providers/aws/provider', () => ({ AWSProvider }));
        // tslint:disable-next-line: variable-name
        const AzureProvider = jest.fn();
        jest.mock('./providers/azure/provider', () => ({ AzureProvider }));
        // tslint:disable-next-line: variable-name
        const GoogleProvider = jest.fn();
        jest.mock('./providers/google/provider', () => ({ GoogleProvider }));

        // Default
        jest.clearAllMocks();
        jest.resetModules();
        (await import('./handler')).handler({}, async () => Result.Ok(OK));
        expect(AWSProvider).toHaveBeenCalledTimes(1);
        expect(AzureProvider).not.toHaveBeenCalled();
        expect(GoogleProvider).not.toHaveBeenCalled();

        // AWS
        jest.clearAllMocks();
        jest.resetModules();
        process.env.PROVIDER = 'aws';
        (await import('./handler')).handler({}, async () => Result.Ok(OK));
        expect(AWSProvider).toHaveBeenCalledTimes(1);
        expect(AzureProvider).not.toHaveBeenCalled();
        expect(GoogleProvider).not.toHaveBeenCalled();

        // Azure
        jest.clearAllMocks();
        jest.resetModules();
        process.env.PROVIDER = 'azure';
        (await import('./handler')).handler({}, async () => Result.Ok(OK));
        expect(AWSProvider).not.toHaveBeenCalled();
        expect(AzureProvider).toHaveBeenCalledTimes(1);
        expect(GoogleProvider).not.toHaveBeenCalled();

        // Google
        jest.clearAllMocks();
        jest.resetModules();
        process.env.PROVIDER = 'google';
        (await import('./handler')).handler({}, async () => Result.Ok(OK));
        expect(AWSProvider).not.toHaveBeenCalled();
        expect(AzureProvider).not.toHaveBeenCalled();
        expect(GoogleProvider).toHaveBeenCalledTimes(1);

        delete process.env.PROVIDER;
    });

    it('should call trace when tracing is enabled', async () => {
        const trace = jest.fn();
        // tslint:disable-next-line: max-classes-per-file
        class AWSProvider {
            public transformRequest = jest.fn(() => ({}));
            public transformResponse = jest.fn();
            public trace = trace;
        }
        jest.mock('./providers/aws/provider', () => ({ AWSProvider }));

        // Without tracing
        jest.resetModules();
        const handle = (await import('./handler')).handler({ traceName: 'test' }, async () => Result.Ok(OK));
        await handle();
        expect(trace).not.toHaveBeenCalled();

        // With tracing
        jest.resetModules();
        process.env.TRACING_ENABLED = 'true';
        const tracedHandle = (await import('./handler')).handler({ traceName: 'test' }, async () => Result.Ok(OK));
        await tracedHandle();
        expect(trace).toHaveBeenCalledTimes(1);

        delete process.env.TRACING_ENABLED;
    });
});
