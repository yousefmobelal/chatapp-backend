import { authRouter } from '@/routes/auth.routes';
import { conversationRouter } from '@/routes/conversation.routes';
import { userRouter } from '@/routes/user.routes';
import type { Router } from 'express';

export const registerRoutes = (app: Router) => {
  app.use('/auth', authRouter);
  app.use('/conversations', conversationRouter);
  app.use('/users', userRouter);
};
