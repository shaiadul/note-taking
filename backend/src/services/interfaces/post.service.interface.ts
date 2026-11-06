import { IPostDocument } from "../../types/post.interface";
import { IPaginatedResult, IPaginationQuery } from "../../types/pagination.interface";
import { IPostWithAuthor } from "../../repositories/interfaces/post.repository.interface";
import { CreatePostDTO, UpdatePostDTO } from "../../validators/post.validator";
import { UserRole } from "../../constants/roles.enum";

export interface IPostService {
  createPost(userId: string, dto: CreatePostDTO): Promise<IPostDocument>;
  getAllPosts(pagination: IPaginationQuery): Promise<IPaginatedResult<IPostDocument>>;
  getPostById(id: string): Promise<IPostDocument>;
  getPostsByUserId(userId: string): Promise<IPostWithAuthor[]>;
  updatePost(id: string, userId: string, role: UserRole, dto: UpdatePostDTO): Promise<IPostDocument>;
  deletePost(id: string, userId: string, role: UserRole): Promise<void>;
}

