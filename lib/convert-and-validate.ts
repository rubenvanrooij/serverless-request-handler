import { ValidateOptions } from './models';
import { plainToClass } from 'class-transformer';
import { validate, ValidatorOptions } from 'class-validator';
import { BAD_REQUEST } from 'http-status-codes';
import { HttpError } from './http-error';

const defaultValidatorOptions: ValidatorOptions = { forbidNonWhitelisted: true, whitelist: true };

export async function convertAndValidate<T>(plain: any, options: ValidateOptions<T>, errorMessage: string): Promise<T> {
    const value = plainToClass(options.classType, plain);
    const errors = await validate(value, options.options || defaultValidatorOptions);

    if (errors.length > 0) {
        throw new HttpError(BAD_REQUEST, errorMessage, ...errors.map((error) => ({
            message: Object.values(error.constraints),
            name: error.property
        })));
    }

    return value;
}
