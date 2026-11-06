import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  content: z.string().min(1).trim()
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  content: z.string().min(1).trim().optional()
});

export type CreatePostDTO = z.infer<typeof createPostSchema>;
export type UpdatePostDTO = z.infer<typeof updatePostSchema>;

