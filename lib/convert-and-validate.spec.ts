import { BAD_REQUEST } from 'http-status-codes';
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import 'reflect-metadata';
import { convertAndValidate } from './convert-and-validate';
import { HttpError } from './http-error';

class DummyClass {
    @IsString()
    public shouldBeString!: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => DummyChildClass)
    public children?: DummyChildClass[];

    constructor(val: string, children?: DummyChildClass[]) {
        this.shouldBeString = val;
        this.children = children;
    }
}

class DummyChildClass {
    @IsString()
    public name!: string;

    constructor(name: string) {
        this.name = name;
    }
}

describe('convert-and-validate', () => {
    it('should convert and validate a class', async () => {
        const value = await convertAndValidate(
            { shouldBeString: 'string' },
            {
                classType: DummyClass
            }, 'ERROR_MESSAGE');

        return expect(value).toEqual(new DummyClass('string'));
    });

    it('should convert and validate a class with children', async () => {
        const value = await convertAndValidate(
            { shouldBeString: 'string', children: [{ name: 'name' }] },
            {
                classType: DummyClass
            }, 'ERROR_MESSAGE');

        return expect(value).toEqual(new DummyClass('string', [{ name: 'name' }]));
    });

    it('should throw an error when validation fails', async () => {
        const fn = convertAndValidate({ shouldBeStrings: 123 }, {
            classType: DummyClass
        }, 'ERROR_MESSAGE');

        return expect(fn)
            .rejects.toEqual(new HttpError(BAD_REQUEST, 'ERROR_MESSAGE'));
    });

    it('should throw an error when child validation fails', async () => {
        const fn = convertAndValidate({ shouldBeStrings: 'string', children: [{ name: 123 }] }, {
            classType: DummyClass
        }, 'ERROR_MESSAGE');

        return expect(fn)
            .rejects.toEqual(new HttpError(BAD_REQUEST, 'ERROR_MESSAGE'));
    });

    it('should throw an error when validation fails with details', async () => {
        const fn = convertAndValidate({ shouldBeStrings: 'string', children: [{ name: 123 }] }, {
            classType: DummyClass
        }, 'ERROR_MESSAGE');

        const messages = [
            {
              message: [ 'property shouldBeStrings should not exist' ],
              name: 'shouldBeStrings'
            },
            {
              message: [ 'shouldBeString must be a string' ],
              name: 'shouldBeString'
            },
            { message: [ 'name must be a string' ], name: 'children.0.name' }
        ];

        expect.assertions(3);
        try {
            await fn;
        } catch (err) {
            expect(err.statusCode).toEqual(BAD_REQUEST);
            expect(err.message).toEqual('ERROR_MESSAGE');
            expect(err.details).toEqual(messages);
        }
    });
});
