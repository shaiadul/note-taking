import { Types } from "mongoose";
import { IPostService } from "./interfaces/post.service.interface";
import { IPostRepository, IPostWithAuthor } from "../repositories/interfaces/post.repository.interface";
import { IUserRepository } from "../repositories/interfaces/user.repository.interface";
import { IPostDocument } from "../types/post.interface";
import { IPaginatedResult, IPaginationQuery } from "../types/pagination.interface";
import { CreatePostDTO, UpdatePostDTO } from "../validators/post.validator";
import { UserRole } from "../constants/roles.enum";
import { ForbiddenError, NotFoundError } from "../errors/app-error";

export class PostService implements IPostService {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly userRepository: IUserRepository
  ) {}

  public async createPost(userId: string, dto: CreatePostDTO): Promise<IPostDocument> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.postRepository.create({
      title: dto.title,
      content: dto.content,
      userId: new Types.ObjectId(userId)
    });
  }

  public async getAllPosts(pagination: IPaginationQuery): Promise<IPaginatedResult<IPostDocument>> {
    return this.postRepository.findAll({}, pagination, { createdAt: -1 });
  }

  public async getPostById(id: string): Promise<IPostDocument> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }
    return post;
  }

  public async getPostsByUserId(userId: string): Promise<IPostWithAuthor[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.postRepository.findPostsByUserIdWithLookup(userId);
  }

  public async updatePost(
    id: string,
    userId: string,
    role: UserRole,
    dto: UpdatePostDTO
  ): Promise<IPostDocument> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    if (role !== UserRole.ADMIN && post.userId.toString() !== userId) {
      throw new ForbiddenError("Access denied: You can only update your own posts");
    }

    const updated = await this.postRepository.updateById(id, dto);
    if (!updated) {
      throw new NotFoundError("Post not found");
    }

    return updated;
  }

  public async deletePost(id: string, userId: string, role: UserRole): Promise<void> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    if (role !== UserRole.ADMIN && post.userId.toString() !== userId) {
      throw new ForbiddenError("Access denied: You can only delete your own posts");
    }

    await this.postRepository.deleteById(id);
  }
}

