import { userProxyService } from '@/services/user-proxy.service';
import { getAuthenticatedUser } from '@/utils/auth';
import {
  createUserSchema,
  searchUsersQuerySchema,
  userIdParamsSchema,
} from '@/validation/user.schema';
import { AsyncHandler } from '@chatapp/common';

export const getUser: AsyncHandler = async (req, res) => {
  const { id } = userIdParamsSchema.parse(req.params);
  const response = await userProxyService.getUserById(id);
  res.json(response);
};

export const getAllUsers: AsyncHandler = async (req, res) => {
  const response = await userProxyService.getAllUsers();
  res.json(response);
};

export const createUser: AsyncHandler = async (req, res) => {
  const payload = createUserSchema.parse(req.body);
  const response = await userProxyService.createUser(payload);
  res.status(201).json(response);
};

export const searchUsers: AsyncHandler = async (req, res) => {
  const user = getAuthenticatedUser(req);
  const { query, limit, exclude } = searchUsersQuerySchema.parse(req.query);
  const sanatizedExclude = Array.from(new Set([...exclude, user.id]));
  const users = await userProxyService.searchUsers({
    query,
    limit,
    excludeIds: sanatizedExclude,
  });

  res.json({ data: users });
};
