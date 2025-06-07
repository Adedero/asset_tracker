"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineValidator = exports.defineHandler = void 0;
const http_1 = require("./http");
/**
 * A higher-order function that wraps an asynchronous handler function with error handling and response formatting.
 *
 * This function ensures that:
 * - If the result is an `HttpException`, it will be thrown and handled by the global error handler.
 * - If the result is a primitive (string, number, boolean), it will be sent directly.
 * - If the result is an instance of `HttpResponse`, it will be sent using `send()`.
 * - If the result is a JSON-serializable object, it will be returned as a JSON response.
 *
 * @param fn - The asynchronous handler function to be wrapped.
 * @returns An Express middleware function that wraps the handler.
 */
const defineHandler = (fn) => {
    return async (req, res, next) => {
        try {
            const result = await fn(req, res, next);
            if (res.headersSent)
                return;
            if (result instanceof http_1.HttpException) {
                next(result);
                return;
            }
            if (result === undefined || result === null) {
                res.status(204).send();
            }
            else if (typeof result === "string" ||
                typeof result === "number" ||
                typeof result === "boolean") {
                res.status(200).send(result);
            }
            else if (result instanceof http_1.HttpResponse) {
                result.send(res);
            }
            else {
                try {
                    res.status(200).json({ success: true, statusCode: res.status, ...result });
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                }
                catch (error) {
                    res.status(200).send(String(result));
                }
            }
        }
        catch (error) {
            next(error);
        }
    };
};
exports.defineHandler = defineHandler;
/**
 * Defines a validation middleware that parses and attaches the validated data to the request object.
 *
 * @param path - Which part of the request to validate (body, query, params, headers)
 * @param schema - The Zod schema to use for validation
 * @param options - Optional custom error handling
 * @returns Express middleware
 */
const defineValidator = (path, schema, options = {}) => {
    return (req, res, next) => {
        const data = req[path];
        const result = schema.safeParse(data);
        if (result.success) {
            const parsed = result.data;
            switch (path) {
                case "body":
                    req.validatedBody = parsed;
                    break;
                case "query":
                    req.validatedQuery = parsed;
                    break;
                case "params":
                    req.validatedParams = parsed;
                    break;
                case "headers":
                    req.validatedHeaders = parsed;
                    break;
            }
            if (options.onSuccess) {
                return options.onSuccess(parsed, req, res, next);
            }
            return next();
        }
        const validationError = result.error;
        if (options.onError) {
            return options.onError(validationError, req, res, next);
        }
        const errorMessage = options.errorMessage || validationError.errors[0].message;
        const error = new http_1.HttpException(400, errorMessage, {
            errorCode: options.errorCode || `VALIDATION_ERROR_${path.toUpperCase()}`,
            data: {
                errors: validationError.errors
            }
        });
        next(error);
    };
};
exports.defineValidator = defineValidator;
