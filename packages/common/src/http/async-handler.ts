/**
 * @file Provides a utility for handling errors in asynchronous Express.js route handlers.
 * @module common/http/async-handler
 */

import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Represents an asynchronous Express request handler.
 * This is a function that takes Express's `req`, `res`, and `next` objects and returns a `Promise`.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next middleware function.
 * @returns A `Promise` that resolves when the handler is complete.
 */
export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * A specific function type for forwarding an error to the next middleware in Express.
 * It only accepts an `Error` object. This provides better type safety and clarity
 * compared to using `NextFunction` directly, which has multiple call signatures.
 * @param error - The error to be passed to the next middleware.
 */
type ErrorForwarder = (error: Error) => void;

/**
 * Converts an unknown caught value into an `Error` object.
 * If the value is already an `Error`, it's returned as is. Otherwise, it's converted to a string
 * and wrapped in a new `Error` object.
 * @param error - The value to convert to an `Error`.
 * @returns An `Error` object.
 */
const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};

/**
 * Forwards a caught error to the next Express error-handling middleware.
 * It ensures that what's being forwarded is always an `Error` object.
 * @param nextFn - The function to call to pass the error to the next middleware.
 * @param error - The caught error, of unknown type.
 */
const forwardError = (nextFn: ErrorForwarder, error: unknown) => {
  nextFn(toError(error));
};

/**
 * A higher-order function that wraps an async Express route handler to catch any rejected promises.
 * This prevents unhandled promise rejections from crashing the server. Instead, it forwards
 * the error to the Express error-handling middleware.
 *
 * @example
 * ```typescript
 * import { asyncHandler } from './async-handler';
 *
 * router.get('/users/:id', asyncHandler(async (req, res, next) => {
 *   const user = await someAsyncOperation(req.params.id);
 *   res.json(user);
 * }));
 * ```
 *
 * @param handler - The asynchronous request handler to wrap.
 * @returns An Express `RequestHandler` that can be used in routes.
 */
export const asyncHandler = (handler: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    void handler(req, res, next).catch((error: unknown) => {
      forwardError(next as ErrorForwarder, error);
    });
  };
};
