import { Schema, model } from "mongoose";
import { INoteDocument } from "../types/note.interface";

const NoteSchema = new Schema<INoteDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ createdAt: -1 });

export const NoteModel = model<INoteDocument>("Note", NoteSchema);
