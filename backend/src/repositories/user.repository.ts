import { Types } from "mongoose";
import { BaseRepository } from "./base.repository";
import { IUserDocument } from "../types/user.interface";
import {
  IInterestsGroupResult,
  IUserRepository,
  IUserWithPostsResult
} from "./interfaces/user.repository.interface";
import { UserModel } from "../models/user.model";

export class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email }).exec();
  }

  public async groupUsersByInterests(): Promise<IInterestsGroupResult[]> {
    return this.model.aggregate<IInterestsGroupResult>([
      { $unwind: "$interests" },
      {
        $group: {
          _id: "$interests",
          users: {
            $push: {
              _id: "$_id",
              name: "$name",
              email: "$email",
              role: "$role"
            }
          },
          totalUsers: { $sum: 1 }
        }
      },
      {
        $sort: {
          totalUsers: -1,
          _id: 1
        }
      }
    ]);
  }

  public async getUserWithPosts(userId: string): Promise<IUserWithPostsResult | null> {
    const results = await this.model.aggregate<IUserWithPostsResult>([
      {
        $match: {
          _id: new Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          interests: 1,
          posts: 1
        }
      }
    ]);

    return results[0] || null;
  }
}

