import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { IUserService } from "../services/interfaces/user.service.interface";

export class UserController extends BaseController {
  constructor(private readonly userService: IUserService) {
    super();
  }

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.createUser(req.body);
      this.sendCreated(res, user, "User created successfully");
    } catch (error) {
      next(error);
    }
  };

  public getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const result = await this.userService.getAllUsers({ page, limit });
      this.sendPaginated(res, result, "Users retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      this.sendSuccess(res, user, "User retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      this.sendSuccess(res, user, "User updated successfully");
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.userService.deleteUser(req.params.id);
      this.sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

