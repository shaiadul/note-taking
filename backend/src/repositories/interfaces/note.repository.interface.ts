import { IBaseRepository } from "./base.repository.interface";
import { INoteDocument } from "../../types/note.interface";
import { IPaginatedResult, IPaginationQuery } from "../../types/pagination.interface";

export interface INoteRepository extends IBaseRepository<INoteDocument> {
  findByUserId(userId: string, pagination: IPaginationQuery): Promise<IPaginatedResult<INoteDocument>>;
  findByIdAndUserId(id: string, userId: string): Promise<INoteDocument | null>;
}

