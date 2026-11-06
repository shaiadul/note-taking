import { z } from "zod";
import { UserRole } from "../constants/roles.enum";

export const registerSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6).max(100),
  role: z.nativeEnum(UserRole).optional().default(UserRole.USER),
  interests: z.array(z.string().min(1).trim().toLowerCase()).optional().default([])
});

export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1)
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;

