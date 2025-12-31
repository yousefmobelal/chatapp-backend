import { HttpError, USER_ID_HEADER } from '@chatapp/common';
import type { RequestHandler } from 'express';
import { z } from '@chatapp/common';

const userIdSchema = z.uuid();

export const attachAuthenticatedUser: RequestHandler = (req, _res, next) => {
  try {
    const headerValue = req.header(USER_ID_HEADER);
    const userId = userIdSchema.parse(headerValue);
    req.user = { id: userId };
    next();
  } catch (error) {
    next(new HttpError(401, 'Invalid or missing user context'));
  }
};
