import { userService } from '@/services/user.service';
import { CreateUserBody, SearchUsersQuery, UserIdParams } from '@/validation/user.schema';
import { Request, Response } from 'express';

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params as unknown as UserIdParams;
  const user = await userService.getUserById(id);
  res.json({ data: user });
};

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.json({ data: users });
};

export const createUser = async (req: Request, res: Response) => {
  const payload = req.body as CreateUserBody;

  const user = await userService.createUser(payload);
  res.status(201).json({ data: user });
};

export const searchUsers = async (req: Request, res: Response) => {
  const { query, limit, exclude } = req.query as unknown as SearchUsersQuery;

  const users = await userService.searchUsers({ query, limit, excludeIds: exclude });
  res.json({ data: users });
};
