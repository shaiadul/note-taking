import jwt from "jsonwebtoken";
import { env } from "../config/env.config";
import { UserRole } from "../constants/roles.enum";

export interface ITokenPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export class TokenUtil {
  public static generateToken(payload: ITokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
    });
  }

  public static verifyToken(token: string): ITokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as ITokenPayload;
  }
}

