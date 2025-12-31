import { z } from '@chatapp/common';

export const createConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  participantIds: z.array(z.uuid()).min(1),
});

export const listConversationQuerySchema = z.object({
  participantId: z.uuid().optional(),
});
