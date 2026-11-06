import { SafeUser } from "../../types/user.interface";
import { LoginDTO, RegisterDTO } from "../../validators/auth.validator";

export interface IAuthResult {
  user: SafeUser;
  token: string;
}

export interface IAuthService {
  register(dto: RegisterDTO): Promise<IAuthResult>;
  login(dto: LoginDTO): Promise<IAuthResult>;
  getProfile(userId: string): Promise<SafeUser>;
}

