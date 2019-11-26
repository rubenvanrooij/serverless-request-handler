import { ValidateOptions, HttpError } from './models';
import { plainToClass } from 'class-transformer';
import { validate, ValidatorOptions } from 'class-validator';
import { BAD_REQUEST } from 'http-status-codes';

const defaultValidatorOptions: ValidatorOptions = { forbidNonWhitelisted: true, whitelist: true };

export async function validateOrThrow<T>(value: T, options: ValidatorOptions = defaultValidatorOptions): Promise<T> {
    const errors = await validate(value, options);

    if (errors.length > 0) {
        throw new HttpError(BAD_REQUEST, 'Invalid body', ...errors.map((error) => ({
            message: Object.values(error.constraints),
            name: error.property
        })));
    }

    return value;
}

export async function convertAndValidate<T>(plain: any, options: ValidateOptions<T>): Promise<T> {
    const value = plainToClass(options.classType, plain);
    return validateOrThrow(value, options.options);
}
