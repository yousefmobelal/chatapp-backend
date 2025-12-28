import { Router } from 'express';
import { authRouter } from './auth.routes';

export const regsiterRoutes = (app: Router) => {
  app.use('/auth', authRouter);
};
