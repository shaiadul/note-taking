import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { IPostService } from "../services/interfaces/post.service.interface";

export class PostController extends BaseController {
  constructor(private readonly postService: IPostService) {
    super();
  }

  public createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const post = await this.postService.createPost(req.user!.userId, req.body);
      this.sendCreated(res, post, "Post created successfully");
    } catch (error) {
      next(error);
    }
  };

  public getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const result = await this.postService.getAllPosts({ page, limit });
      this.sendPaginated(res, result, "Posts retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  public getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const post = await this.postService.getPostById(req.params.id);
      this.sendSuccess(res, post, "Post retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  public getPostsByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const posts = await this.postService.getPostsByUserId(req.params.userId);
      this.sendSuccess(res, posts, "User posts retrieved successfully via aggregation");
    } catch (error) {
      next(error);
    }
  };

  public updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const post = await this.postService.updatePost(
        req.params.id,
        req.user!.userId,
        req.user!.role,
        req.body
      );
      this.sendSuccess(res, post, "Post updated successfully");
    } catch (error) {
      next(error);
    }
  };

  public deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.postService.deletePost(req.params.id, req.user!.userId, req.user!.role);
      this.sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

