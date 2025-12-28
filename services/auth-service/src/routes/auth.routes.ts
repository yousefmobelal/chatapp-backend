import { registerHandler } from '@/controllers/auth.controller';
import { validateRequest } from '@chatapp/common';
import { Router } from 'express';
import { loginSchema, registerSchema } from '@/routes/auth.schema';

export const authRouter: Router = Router();

authRouter.post('/register', validateRequest({ body: registerSchema.shape.body }), registerHandler);
// authRouter.post('/login', validateRequest({body: loginSchema.shape.body}), loginHandler)
