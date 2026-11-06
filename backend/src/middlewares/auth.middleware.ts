import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/app-error";
import { TokenUtil } from "../utils/token.util";

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication token is missing or malformed");
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = TokenUtil.verifyToken(token);
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired authentication token");
  }
};

