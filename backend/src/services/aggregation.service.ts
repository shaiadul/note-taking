import { IAggregationService } from "./interfaces/aggregation.service.interface";
import {
  IInterestsGroupResult,
  IUserRepository,
  IUserWithPostsResult
} from "../repositories/interfaces/user.repository.interface";
import {
  IPostRepository,
  IPostWithAuthor
} from "../repositories/interfaces/post.repository.interface";
import { NotFoundError } from "../errors/app-error";

export class AggregationService implements IAggregationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly postRepository: IPostRepository
  ) {}

  public async getUsersGroupedByInterests(): Promise<IInterestsGroupResult[]> {
    return this.userRepository.groupUsersByInterests();
  }

  public async getUserPostsWithLookup(userId: string): Promise<IPostWithAuthor[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return this.postRepository.findPostsByUserIdWithLookup(userId);
  }

  public async getUserWithPostsLookup(userId: string): Promise<IUserWithPostsResult> {
    const result = await this.userRepository.getUserWithPosts(userId);
    if (!result) {
      throw new NotFoundError("User not found");
    }
    return result;
  }
}

