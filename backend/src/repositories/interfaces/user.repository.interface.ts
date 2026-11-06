import { IBaseRepository } from "./base.repository.interface";
import { IUserDocument } from "../../types/user.interface";

export interface IInterestsGroupResult {
  _id: string;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
  totalUsers: number;
}

export interface IUserWithPostsResult {
  _id: string;
  name: string;
  email: string;
  role: string;
  interests: string[];
  posts: Array<{
    _id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export interface IUserRepository extends IBaseRepository<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  groupUsersByInterests(): Promise<IInterestsGroupResult[]>;
  getUserWithPosts(userId: string): Promise<IUserWithPostsResult | null>;
}

