import { Schema, model } from "mongoose";
import { IPostDocument } from "../types/post.interface";

const PostSchema = new Schema<IPostDocument>(
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

PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });

export const PostModel = model<IPostDocument>("Post", PostSchema);

