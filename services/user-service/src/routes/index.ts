import { userRoutes } from '@/routes/user.routes';
import type { Router } from 'express';

export const regsiterRoutes = (app: Router) => {
  // Health check endpoint for Docker/K8s
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'auth-service' });
  });
  app.use('/users', userRoutes);
};
