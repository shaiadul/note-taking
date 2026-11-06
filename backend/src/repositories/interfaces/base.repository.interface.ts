import { Document, FilterQuery, UpdateQuery } from "mongoose";
import { IPaginatedResult, IPaginationQuery } from "../../types/pagination.interface";

export interface IBaseRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  findAll(filter: FilterQuery<T>, pagination: IPaginationQuery, sort?: Record<string, 1 | -1>): Promise<IPaginatedResult<T>>;
  updateById(id: string, update: UpdateQuery<T>): Promise<T | null>;
  deleteById(id: string): Promise<T | null>;
}

