import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required")
});

export const registerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50).trim(),
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]),
  interests: z.string().optional()
});

export const noteFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title cannot exceed 200 characters").trim(),
  content: z.string().min(1, "Content cannot be empty").trim()
});

export const postFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title cannot exceed 200 characters").trim(),
  content: z.string().min(1, "Content cannot be empty").trim()
});

export const userEditFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50).trim(),
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().optional(),
  role: z.enum(["user", "admin"]),
  interests: z.string().optional()
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type NoteFormValues = z.infer<typeof noteFormSchema>;
export type PostFormValues = z.infer<typeof postFormSchema>;
export type UserEditFormValues = z.infer<typeof userEditFormSchema>;
