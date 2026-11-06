import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  content: z.string().min(1).trim()
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  content: z.string().min(1).trim().optional()
});

export type CreateNoteDTO = z.infer<typeof createNoteSchema>;
export type UpdateNoteDTO = z.infer<typeof updateNoteSchema>;

