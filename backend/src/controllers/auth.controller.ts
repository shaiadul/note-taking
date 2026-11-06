import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { IAuthService } from "../services/interfaces/auth.service.interface";

export class AuthController extends BaseController {
  constructor(private readonly authService: IAuthService) {
    super();
  }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      this.sendCreated(res, result, "User registered successfully");
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      this.sendSuccess(res, result, "Logged in successfully");
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.getProfile(req.user!.userId);
      this.sendSuccess(res, user, "Profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  };
}

