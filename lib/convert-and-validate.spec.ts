import { BAD_REQUEST } from 'http-status-codes';
import { IsString } from 'class-validator';
import { convertAndValidate } from './convert-and-validate';
import { HttpError } from './http-error';

class DummyClass {
    @IsString()
    public shouldBeString!: string;

    constructor(val: string) {
        this.shouldBeString = val;
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

    it('should throw an error when validation fails', async () => {
        const fn = convertAndValidate({ shouldBeStrings: 123 }, {
            classType: DummyClass
        }, 'ERROR_MESSAGE');

        return expect(fn)
            .rejects.toEqual(new HttpError(BAD_REQUEST, 'ERROR_MESSAGE'));
    });
});
