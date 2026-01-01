import {
  createConversationHandler,
  createMessageHandler,
  getConversationHandler,
  listConversationsHandler,
  listMessageHandler,
} from '@/controllers/conversation.controller';
import { attachAuthenticatedUser } from '@/middleware/authenticated-user';
import {
  createConversationSchema,
  listConversationQuerySchema,
} from '@/validation/conversation.schema';
import { createMessageBodySchema, listMessagesQuerySchema } from '@/validation/message.schema';
import { conversationIdParamsSchema } from '@/validation/shared.schema';
import { validateRequest } from '@chatapp/common';
import { Router } from 'express';

export const conversationRouter: Router = Router();

conversationRouter.use(attachAuthenticatedUser);

conversationRouter
  .route('/')
  .post(validateRequest({ body: createConversationSchema }), createConversationHandler)
  .get(validateRequest({ query: listConversationQuerySchema }), listConversationsHandler);

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
    listMessageHandler,
  );
