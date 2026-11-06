import { Document, Types } from "mongoose";

export interface IPost {
  _id?: Types.ObjectId;
  title: string;
  content: string;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPostDocument extends IPost, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

