import { IPaginatedResult, IPaginationQuery } from "../../types/pagination.interface";
import { SafeUser } from "../../types/user.interface";
import { CreateUserDTO, UpdateUserDTO } from "../../validators/user.validator";

export interface IUserService {
  createUser(dto: CreateUserDTO): Promise<SafeUser>;
  getUserById(id: string): Promise<SafeUser>;
  getAllUsers(pagination: IPaginationQuery): Promise<IPaginatedResult<SafeUser>>;
  updateUser(id: string, dto: UpdateUserDTO): Promise<SafeUser>;
  deleteUser(id: string): Promise<void>;
}

