import { Types } from "mongoose";
import { BaseRepository } from "./base.repository";
import { IPostDocument } from "../types/post.interface";
import { IPostRepository, IPostWithAuthor } from "./interfaces/post.repository.interface";
import { PostModel } from "../models/post.model";

export class PostRepository extends BaseRepository<IPostDocument> implements IPostRepository {
  constructor() {
    super(PostModel);
  }

  public async findPostsByUserIdWithLookup(userId: string): Promise<IPostWithAuthor[]> {
    return this.model.aggregate<IPostWithAuthor>([
      {
        $match: {
          userId: new Types.ObjectId(userId)
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "author"
        }
      },
      {
        $unwind: "$author"
      },
      {
        $project: {
          _id: 1,
          title: 1,
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          author: {
            _id: "$author._id",
            name: "$author.name",
            email: "$author.email"
          }
        }
      }
    ]);
  }
}

