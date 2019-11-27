"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const http_status_codes_1 = require("http-status-codes");
const http_error_1 = require("./http-error");
const defaultValidatorOptions = { forbidNonWhitelisted: true, whitelist: true };
async function convertAndValidate(plain, options, errorMessage) {
    const value = class_transformer_1.plainToClass(options.classType, plain);
    const errors = await class_validator_1.validate(value, options.options || defaultValidatorOptions);
    if (errors.length > 0) {
        throw new http_error_1.HttpError(http_status_codes_1.BAD_REQUEST, errorMessage, ...errors.map((error) => ({
            message: Object.values(error.constraints),
            name: error.property
        })));
    }
    return value;
}
exports.convertAndValidate = convertAndValidate;
//# sourceMappingURL=convert-and-validate.js.map