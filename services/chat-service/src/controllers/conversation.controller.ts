import { asyncHandler, HttpError } from '@chatapp/common';
import type { RequestHandler } from 'express';
import {
  createConversationSchema,
  listConversationQuerySchema,
} from '@/validation/conversation.schema';
import { getAuthenticatedUser } from '@/utils/auth';
import { conversationService } from '@/services/conversation.service';
import { conversationIdParamsSchema } from '@/validation/shared.schema';

const parsedConversation = (params: unknown) => {
  const { id } = conversationIdParamsSchema.parse(params);
  return id;
};

export const createConversationHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const payload = createConversationSchema.parse(req.body);
  const uniqueParticipantIds = Array.from(new Set([...payload.participantIds, user.id]));

  if (uniqueParticipantIds.length < 2) {
    throw new HttpError(400, 'A conversation must have at least two unique participants.');
  }

  const conversation = await conversationService.createConversation({
    title: payload.title,
    participantIds: uniqueParticipantIds,
  });

  res.status(201).json({ data: conversation });
});

export const listConversationsHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const query = listConversationQuerySchema.parse(req.query);
  if (query.participantId && query.participantId !== user.id) {
    throw new HttpError(403, 'Forbidden to list conversations for other participants.');
  }

  const conversations = await conversationService.listConversation({
    participantId: user.id,
  });

  res.json({ data: conversations });
});

export const getConversationHandler: RequestHandler = asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const conversationId = parsedConversation(req.params);
  const conversation = await conversationService.getConversationById(conversationId);

  if (!conversation.participantIds.includes(user.id)) {
    throw new HttpError(403, 'Forbidden to access this conversation.');
  }
  res.json({ data: conversation });
});
