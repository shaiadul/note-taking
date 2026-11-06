import { IBaseRepository } from "./base.repository.interface";
import { IPostDocument } from "../../types/post.interface";

export interface IPostWithAuthor {
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface IPostRepository extends IBaseRepository<IPostDocument> {
  findPostsByUserIdWithLookup(userId: string): Promise<IPostWithAuthor[]>;
}

