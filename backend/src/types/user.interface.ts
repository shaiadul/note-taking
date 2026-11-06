import { Document, Types } from "mongoose";
import { UserRole } from "../constants/roles.enum";

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  interests: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<IUser, "password">;

