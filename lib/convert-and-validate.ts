import { ValidateOptions, IErrorDetail } from './models';
import { plainToClass } from 'class-transformer';
import { validate, ValidatorOptions, ValidationError } from 'class-validator';
import { BAD_REQUEST } from 'http-status-codes';
import { HttpError } from './http-error';

const defaultValidatorOptions: ValidatorOptions = { forbidNonWhitelisted: true, whitelist: true };

function extractErrorMessages(errors: ValidationError[]): IErrorDetail[] {
    const messages: IErrorDetail[] = [];

    for (const error of errors) {
        if (error.constraints) {
            messages.push({
                message: Object.values(error.constraints),
                name: error.property,
            });
        }
        if (error.children) {
            messages.push(...extractErrorMessages(error.children));
        }
    }

    return messages;
}

export async function convertAndValidate<T>(plain: any, options: ValidateOptions<T>, errorMessage: string): Promise<T> {
    const value = plainToClass(options.classType, plain);
    const errors = await validate(value, options.options || defaultValidatorOptions);

    if (errors.length > 0) {
        throw new HttpError(BAD_REQUEST, errorMessage, ...extractErrorMessages(errors));
    }

    return value;
}
