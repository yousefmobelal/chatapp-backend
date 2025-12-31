import { requireAuth } from '@/middleware/require-auth';
import {
  conversationIdParamsSchema,
  createConversationBodySchema,
  listConversationsQuerySchema,
} from '@/validation/conversation.schema';
import { Router } from 'express';
import { validateRequest } from '@chatapp/common';
import {
  createConversationHandler,
  getConversationHandler,
  listConversationsHandler,
} from '@/controllers/conversation.controller';

export const conversationRouter: Router = Router();

conversationRouter.use(requireAuth);

conversationRouter.post(
  '/',
  validateRequest({ body: createConversationBodySchema }),
  createConversationHandler,
);

conversationRouter.get(
  '/',
  validateRequest({ query: listConversationsQuerySchema }),
  listConversationsHandler,
);

conversationRouter.get(
  '/:id',
  validateRequest({ params: conversationIdParamsSchema }),
  getConversationHandler,
);
