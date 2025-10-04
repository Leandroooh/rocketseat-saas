import z from 'zod';
import { roleSchema } from '../roles';

export const userModel = z.object({
  id: z.string(),
  role: roleSchema,
});

export type User = z.infer<typeof userModel>;
