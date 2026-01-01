import { authRouter } from '@/routes/auth.routes';
import { conversationRouter } from '@/routes/conversation.routes';
import { userRouter } from '@/routes/user.routes';
import type { Router } from 'express';

export const registerRoutes = (app: Router) => {
  // Health check endpoint for Docker/K8s
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'gateway-service' });
  });

  app.use('/auth', authRouter);
  app.use('/conversations', conversationRouter);
  app.use('/users', userRouter);
};
