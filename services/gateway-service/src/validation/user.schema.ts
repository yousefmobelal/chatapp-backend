import { z } from '@chatapp/common';

export const createUserSchema = z.object({
  email: z.email(),
  displayName: z.string().min(3).max(50),
});

export const userIdParamsSchema = z.object({
  id: z.uuid(),
});

const excludeSchema = z.union([
  z.array(z.uuid()),
  z
    .uuid()
    .transform((value) => [value])
    .optional()
    .transform((value) => value ?? []),
]);

export const searchUsersQuerySchema = z.object({
  query: z.string().trim().min(2).max(100),
  limit: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine(
      (value) => Number.isInteger(value) && value > 0 && value <= 25,
      'Limit must be an integer between 1 and 25',
    )
    .optional(),
  exclude: excludeSchema,
});

export type SearchUsersQuery = z.infer<typeof searchUsersQuerySchema>;
