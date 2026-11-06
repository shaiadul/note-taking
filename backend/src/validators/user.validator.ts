import { z } from "zod";
import { UserRole } from "../constants/roles.enum";

export const createUserSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6).max(100),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  interests: z.array(z.string().min(1).trim().toLowerCase()).default([])
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  interests: z.array(z.string().min(1).trim().toLowerCase()).optional()
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

