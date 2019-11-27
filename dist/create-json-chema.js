"use strict";
// import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
// import { getFromContainer, MetadataStorage } from 'class-validator';
// import { HandlerOptions, ValidateOptions } from './models';
// function createRequestBody<T>(body: ValidateOptions<T>): any {
//     const metadata = getFromContainer(MetadataStorage).getTargetValidationMetadatas(body.classType, '');
//     const schema = validationMetadatasToSchemas(metadata);
//     return {
//         in: 'body',
//         name: 'body',
//         description: 'Optional description',
//         required: true,
//         schema: schema[body.classType.name]
//     };
// }
// export function createJsonSchema<T1, T2, T3, T4, TResponse = unknown>(
//     options: HandlerOptions<T1, T2, T3, T4, TResponse>): any {
//     return {
//             '/scopes': {
//                 post: {
//                     summary: 'Short description about the function?',
//                     parameters: options.body ? [
//                         createRequestBody(options.body)
//                     ] : [],
//                     responses: {
//                         201: {
//                             description: 'Createed!'
//                         }
//                     }
//                 }
//             }
//     };
// }
//# sourceMappingURL=create-json-chema.js.map