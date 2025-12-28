import { authProxyService } from '@/services/auth-proxy.service';
import { logger } from '@/utils/logger';
import { registerSchema } from '@/validation/auth.schema';
import { AsyncHandler } from '@chatapp/common';

export const registerUser: AsyncHandler = async (req, res, next) => {
  try {
    logger.info('Hello from auth controller gateway');
    const payload = registerSchema.parse(req.body);
    const response = await authProxyService.register(payload);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
