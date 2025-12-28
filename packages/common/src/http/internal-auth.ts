/**
 * @file Provides a middleware for internal service-to-service authentication.
 * @module common/http/internal-auth
 */

import { HttpError } from '../errors/http-error';
import type { RequestHandler } from 'express';

/**
 * Options for configuring the internal authentication middleware.
 */
export interface InternalAuthOptions {
  /**
   * The name of the HTTP header to check for the authentication token.
   * @default 'x-internal-token'
   */
  headerName?: string;
  /**
   * An array of URL paths to exempt from authentication checks.
   */
  exemptPaths?: string[];
}

/**
 * The default header name used for the internal authentication token.
 */
const DEFAULT_HEADER_NAME = 'x-internal-token';

/**
 * Creates an Express middleware for authenticating internal service-to-service requests.
 * It checks for a specific token in a designated HTTP header.
 *
 * @example
 * ```typescript
 * import { createInternalAuthMiddleware } from './internal-auth';
 *
 * const app = express();
 * const internalAuth = createInternalAuthMiddleware('my-secret-token', {
 *   exemptPaths: ['/healthz']
 * });
 *
 * app.use(internalAuth);
 *
 *  Requests to this endpoint will require the 'x-internal-token' header
 *  with the value 'my-secret-token'.
 * app.get('/internal/data', (req, res) => {
 *   res.json({ secret: 'data' });
 * });
 *
 *  Requests to this endpoint will be allowed without the token.
 * app.get('/healthz', (req, res) => {
 *   res.send('OK');
 * });
 * ```
 *
 * @param expectedToken - The secret token that is expected in the request header.
 * @param options - Configuration options for the middleware.
 * @returns An Express `RequestHandler` that performs the authentication check.
 */
export const createInternalAuthMiddleware = (
  expectedToken: string,
  options: InternalAuthOptions = {},
): RequestHandler => {
  const headerName = options.headerName?.toLowerCase() ?? DEFAULT_HEADER_NAME;
  const exemptPaths = new Set(options.exemptPaths ?? []);

  return (req, _res, next) => {
    if (exemptPaths.has(req.path)) {
      return next();
    }

    const provided = req.headers[headerName];
    const token = Array.isArray(provided) ? provided[0] : provided;
    if (typeof token !== 'string' || token !== expectedToken) {
      const error = JSON.stringify({
        providedToken: token,
        expectedToken: expectedToken,
        headerName: headerName,
      });
      return next(new HttpError(401, error));
    }
    next();
  };
};
