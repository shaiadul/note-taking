import { Document, FilterQuery, Model, UpdateQuery } from "mongoose";
import { IBaseRepository } from "./interfaces/base.repository.interface";
import { IPaginatedResult, IPaginationQuery } from "../types/pagination.interface";

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  public async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return (await document.save()) as T;
  }

  public async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  public async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  public async findAll(
    filter: FilterQuery<T> = {},
    pagination: IPaginationQuery = {},
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<IPaginatedResult<T>> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.max(1, Math.min(100, pagination.limit || 10));
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec()
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  public async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  public async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}

