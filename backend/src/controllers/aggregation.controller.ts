import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { IAggregationService } from "../services/interfaces/aggregation.service.interface";

export class AggregationController extends BaseController {
  constructor(private readonly aggregationService: IAggregationService) {
    super();
  }

  public getUsersByInterests = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.aggregationService.getUsersGroupedByInterests();
      this.sendSuccess(res, result, "Users grouped by interests retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  public getUserPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.aggregationService.getUserPostsWithLookup(req.params.userId);
      this.sendSuccess(res, result, "User posts retrieved successfully via $lookup aggregation");
    } catch (error) {
      next(error);
    }
  };

  public getUserWithPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.aggregationService.getUserWithPostsLookup(req.params.userId);
      this.sendSuccess(res, result, "User profile with posts retrieved successfully via $lookup aggregation");
    } catch (error) {
      next(error);
    }
  };
}

