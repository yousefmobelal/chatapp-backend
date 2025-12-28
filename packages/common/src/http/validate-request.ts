/**
 * @file Provides a middleware for validating Express requests using Zod schemas.
 * @module common/http/validate-request
 */

import { HttpError } from '../errors/http-error';
import type { NextFunction, Request, Response } from 'express';
import { ZodError, ZodObject, ZodType } from 'zod';

/**
 * Represents a Zod schema for validation. It can be a general Zod type or a Zod object.
 */
type Schema = ZodType<unknown> | ZodObject<any>;
/**
 * Represents the structure of request parameters after parsing.
 */
type ParamsRecord = Record<string, string>;
/**
 * Represents the structure of the query string after parsing.
 */
type QueryRecord = Record<string, unknown>;

/**
 * Defines the schemas for validating different parts of an Express request.
 */
export interface RequestValidationSchemas {
  /** A Zod schema to validate the request body. */
  body?: Schema;
  /** A Zod schema to validate the request URL parameters. */
  params?: Schema;
  /** A Zod schema to validate the request query string. */
  query?: Schema;
}

/**
 * Formats a ZodError into a more readable array of validation issues.
 * @param error - The ZodError to format.
 * @returns An array of objects, each representing a validation issue.
 */
const formattedError = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

/**
 * Creates an Express middleware to validate the request's body, params, and query against Zod schemas.
 * If validation fails, it passes an `HttpError` with a 422 status code to the next middleware.
 *
 * @example
 * ```typescript
 * import { validateRequest } from './validate-request';
 * import { z } from 'zod';
 *
 * const createUserSchema = {
 *   body: z.object({
 *     email: z.string().email(),
 *     password: z.string().min(8),
 *   }),
 * };
 *
 * router.post('/users', validateRequest(createUserSchema), (req, res) => {
 *! At this point, req.body is guaranteed to be valid.
 *   const { email, password } = req.body;
 *! ... create user logic
 * });
 * ```
 *
 * @param schemas - An object containing the Zod schemas for validation.
 * @returns An Express `RequestHandler` that performs the validation.
 */
export const validateRequest = (schemas: RequestValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body) as unknown;
        req.body = parsedBody;
      }

      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params) as ParamsRecord;
        req.params = parsedParams as Request['params'];
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query) as QueryRecord;
        req.query = parsedQuery as Request['query'];
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new HttpError(422, 'Validation Error', {
            issues: formattedError(error),
          }),
        );
        return;
      }
      next(error);
    }
  };
};
