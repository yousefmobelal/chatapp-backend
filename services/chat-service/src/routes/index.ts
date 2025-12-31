import { conversationRouter } from '@/routes/conversation.routes';
import { Router } from 'express';

export const registerRoutes = (app: Router) => {
  app.use('/conversations', conversationRouter);
};
