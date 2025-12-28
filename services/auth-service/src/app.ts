import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from '@/middleware/error-handler';
import { regsiterRoutes } from '@/routes';
import { createInternalAuthMiddleware } from '@chatapp/common';
import { env } from '@/config/env';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    console.log(`This is the headers: ${JSON.stringify(req.headers)}`);
    next();
  }, createInternalAuthMiddleware(env.INTERNAL_API_TOKEN));

  regsiterRoutes(app);

  app.use((_, res) => {
    res.status(404).json({ message: 'Not Found' });
  });

  app.use(errorHandler);

  return app;
};
