import { z } from '@chatapp/common';

export const createConversationBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  participantIds: z.array(z.uuid()).min(1),
});

export const listConversationsQuerySchema = z.object({
  participantId: z.uuid().optional(),
});

export const conversationIdParamsSchema = z.object({
  id: z.uuid(),
});
