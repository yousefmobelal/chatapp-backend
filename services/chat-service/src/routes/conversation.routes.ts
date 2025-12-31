import {
  createConversationHandler,
  getConversationHandler,
  listConversationsHandler,
} from '@/controllers/conversation.controller';
import { attachAuthenticatedUser } from '@/middleware/authenticated-user';
import {
  createConversationSchema,
  listConversationQuerySchema,
} from '@/validation/conversation.schema';
import { conversationIdParamsSchema } from '@/validation/shared.schema';
import { validateRequest } from '@chatapp/common';
import { Router } from 'express';

export const conversationRouter: Router = Router();

conversationRouter.use(attachAuthenticatedUser);

conversationRouter.post(
  '/',
  validateRequest({ body: createConversationSchema }),
  createConversationHandler,
);
conversationRouter.get(
  '/',
  validateRequest({ query: listConversationQuerySchema }),
  listConversationsHandler,
);
conversationRouter.get(
  '/:id',
  validateRequest({ params: conversationIdParamsSchema }),
  getConversationHandler,
);
