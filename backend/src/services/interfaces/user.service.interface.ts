import { IPaginatedResult, IPaginationQuery } from "../../types/pagination.interface";
import { SafeUser } from "../../types/user.interface";
import { CreateUserDTO, UpdateUserDTO } from "../../validators/user.validator";
import { UserRole } from "../../constants/roles.enum";

export interface IUserService {
  createUser(dto: CreateUserDTO): Promise<SafeUser>;
  getUserById(id: string, requesterId: string, requesterRole: UserRole): Promise<SafeUser>;
  getAllUsers(pagination: IPaginationQuery): Promise<IPaginatedResult<SafeUser>>;
  updateUser(id: string, requesterId: string, requesterRole: UserRole, dto: UpdateUserDTO): Promise<SafeUser>;
  deleteUser(id: string): Promise<void>;
}

