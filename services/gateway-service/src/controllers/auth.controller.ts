import { authProxyService } from '@/services/auth-proxy.service';
import { logger } from '@/utils/logger';
import { loginSchema, refreshSchema, registerSchema, revokeSchema } from '@/validation/auth.schema';
import { AsyncHandler } from '@chatapp/common';

export const registerUser: AsyncHandler = async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const response = await authProxyService.register(payload);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const loginUser: AsyncHandler = async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const response = await authProxyService.login(payload);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const refreshToken: AsyncHandler = async (req, res, next) => {
  try {
    const payload = refreshSchema.parse(req.body);
    const response = await authProxyService.refreshToken(payload);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const revokeToken: AsyncHandler = async (req, res, next) => {
  try {
    const payload = revokeSchema.parse(req.body);
    const response = await authProxyService.revokeToken(payload);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
