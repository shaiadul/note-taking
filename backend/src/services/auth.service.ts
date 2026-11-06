import { IAuthResult, IAuthService } from "./interfaces/auth.service.interface";
import { IUserRepository } from "../repositories/interfaces/user.repository.interface";
import { LoginDTO, RegisterDTO } from "../validators/auth.validator";
import { SafeUser } from "../types/user.interface";
import { ConflictError, NotFoundError, UnauthorizedError } from "../errors/app-error";
import { PasswordUtil } from "../utils/password.util";
import { TokenUtil } from "../utils/token.util";

export class AuthService implements IAuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  public async register(dto: RegisterDTO): Promise<IAuthResult> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError("Email already in use");
    }

    const hashedPassword = await PasswordUtil.hash(dto.password);

    const userDoc = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      interests: dto.interests
    });

    const user = userDoc.toJSON() as unknown as SafeUser;
    const token = TokenUtil.generateToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: userDoc.role
    });

    return { user, token };
  }

  public async login(dto: LoginDTO): Promise<IAuthResult> {
    const userDoc = await this.userRepository.findByEmail(dto.email);
    if (!userDoc) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await PasswordUtil.compare(dto.password, userDoc.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const user = userDoc.toJSON() as unknown as SafeUser;
    const token = TokenUtil.generateToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: userDoc.role
    });

    return { user, token };
  }

  public async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user.toJSON() as unknown as SafeUser;
  }
}
