import { authRouter } from '@/routes/auth.routes';
import { userRouter } from '@/routes/user.routes';
import type { Router } from 'express';

export const registerRoutes = (app: Router) => {
  app.use('/auth', authRouter);
  app.use('/users', userRouter);
};
