import { z } from "zod";
import { Types } from "mongoose";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

export const idParamSchema = z.object({
  id: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ID format"
  })
});

export const userIdParamSchema = z.object({
  userId: z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid user ID format"
  })
});

