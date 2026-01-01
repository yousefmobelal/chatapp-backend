import { conversationRouter } from '@/routes/conversation.routes';
import { Router } from 'express';

export const registerRoutes = (app: Router) => {
  // Health check endpoint for Docker/K8s
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'auth-service' });
  });
  app.use('/conversations', conversationRouter);
};
