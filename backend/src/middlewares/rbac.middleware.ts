import { NextFunction, Request, Response } from "express";
import { UserRole } from "../constants/roles.enum";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error";

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError("Access forbidden: Insufficient permissions");
    }

    next();
  };
};

