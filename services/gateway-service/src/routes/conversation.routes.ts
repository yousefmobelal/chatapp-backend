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
  createMessageHandler,
  getConversationHandler,
  listConversationsHandler,
  listMessagesHandler,
} from '@/controllers/conversation.controller';
import { createMessageBodySchema, listMessagesQuerySchema } from '@/validation/message.schema';

export const conversationRouter: Router = Router();

conversationRouter.use(requireAuth);

conversationRouter
  .route('/')
  .post(validateRequest({ body: createConversationBodySchema }), createConversationHandler)
  .get(validateRequest({ query: listConversationsQuerySchema }), listConversationsHandler);

conversationRouter.get(
  '/:id',
  validateRequest({ params: conversationIdParamsSchema }),
  getConversationHandler,
);

conversationRouter
  .route('/:id/messages')
  .post(
    validateRequest({ params: conversationIdParamsSchema, body: createMessageBodySchema }),
    createMessageHandler,
  )
  .get(
    validateRequest({ params: conversationIdParamsSchema, query: listMessagesQuerySchema }),
    listMessagesHandler,
  );
