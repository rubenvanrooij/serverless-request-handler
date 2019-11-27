# serverless-request-handler
A request handler that uses class-transformer and class-validator to create a type-safe serverless handler

## What is serverless-request-handler
Serverless request handler is a micro-framework that's here to make your life easier. You give it an options object with what you expect the request to look like; and it does the object request transformation, request validation, response validation and error handdling. 

A typical handler will look like this.
```typescript

class CreateUserDto {
    @IsEmail()
    userName: string;

    @IsString()
    @MinLength(7)
    password: string;
}

class UserPathParams {
    @IsNumber()
    userId: number;
}

const options = {
    body: {
        classType: CreateUserDto
    },
    pathParameters: {
        classType: UserPathParams
    }
};


const createUser = handler(options, async (event) => {
    return Result.Ok(201, userService.create(event.pathParameters.userId, event.body));
});

```

## Installation

1. Install module:

    `npm install serverless-request-handler --save`

2. `reflect-metadata` shim is required, install it too:

    `npm install reflect-metadata --save`

    and make sure to import it in a global place, like server.ts:

    ```typescript
    import "reflect-metadata";
    ```

3. `class-validator` and `class-transfrormer` are required peer dependencies

    `npm install class-validator class-transfrormer  --save`

3. ES6 features are used, if you are using old version of node.js you may need to install es6-shim:

   `npm install es6-shim --save`

   and import it in a global place like app.ts:

    ```typescript
    import "es6-shim";
    ```
