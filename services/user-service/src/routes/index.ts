import { userRoutes } from '@/routes/user.routes';
import type { Router } from 'express';

export const regsiterRoutes = (app: Router) => {
  app.use('/users', userRoutes);
};
