import { Document, Types } from "mongoose";

export interface INote {
  _id?: Types.ObjectId;
  title: string;
  content: string;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INoteDocument extends INote, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
