import { IUserService } from "./interfaces/user.service.interface";
import { IUserRepository } from "../repositories/interfaces/user.repository.interface";
import { CreateUserDTO, UpdateUserDTO } from "../validators/user.validator";
import { SafeUser } from "../types/user.interface";
import { IPaginatedResult, IPaginationQuery } from "../types/pagination.interface";
import { ConflictError, ForbiddenError, NotFoundError } from "../errors/app-error";
import { UserRole } from "../constants/roles.enum";
import { PasswordUtil } from "../utils/password.util";

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  public async createUser(dto: CreateUserDTO): Promise<SafeUser> {
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

    return userDoc.toJSON() as unknown as SafeUser;
  }

  public async getUserById(id: string, requesterId: string, requesterRole: UserRole): Promise<SafeUser> {
    if (requesterRole !== UserRole.ADMIN && requesterId !== id) {
      throw new ForbiddenError("Access denied: You can only view your own profile");
    }

    const userDoc = await this.userRepository.findById(id);
    if (!userDoc) {
      throw new NotFoundError("User not found");
    }
    return userDoc.toJSON() as unknown as SafeUser;
  }

  public async getAllUsers(pagination: IPaginationQuery): Promise<IPaginatedResult<SafeUser>> {
    const result = await this.userRepository.findAll({}, pagination, { createdAt: -1 });

    return {
      data: result.data.map((user) => user.toJSON() as unknown as SafeUser),
      pagination: result.pagination
    };
  }

  public async updateUser(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
    dto: UpdateUserDTO
  ): Promise<SafeUser> {
    if (requesterRole !== UserRole.ADMIN && requesterId !== id) {
      throw new ForbiddenError("Access denied: You can only update your own profile");
    }

    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("User not found");
    }

    if (dto.email && dto.email !== existing.email) {
      const emailTaken = await this.userRepository.findByEmail(dto.email);
      if (emailTaken) {
        throw new ConflictError("Email already in use");
      }
    }

    const updatePayload: Record<string, unknown> = { ...dto };
    if (requesterRole !== UserRole.ADMIN) {
      delete updatePayload.role;
    }

    if (dto.password) {
      updatePayload.password = await PasswordUtil.hash(dto.password);
    }

    const updated = await this.userRepository.updateById(id, updatePayload);
    if (!updated) {
      throw new NotFoundError("User not found");
    }

    return updated.toJSON() as unknown as SafeUser;
  }

  public async deleteUser(id: string): Promise<void> {
    const deleted = await this.userRepository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError("User not found");
    }
  }
}
