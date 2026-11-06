import { IInterestsGroupResult, IUserWithPostsResult } from "../../repositories/interfaces/user.repository.interface";
import { IPostWithAuthor } from "../../repositories/interfaces/post.repository.interface";

export interface IAggregationService {
  getUsersGroupedByInterests(): Promise<IInterestsGroupResult[]>;
  getUserPostsWithLookup(userId: string): Promise<IPostWithAuthor[]>;
  getUserWithPostsLookup(userId: string): Promise<IUserWithPostsResult>;
}

