import { Types } from "mongoose";
import { BaseRepository } from "./base.repository";
import { INoteDocument } from "../types/note.interface";
import { INoteRepository } from "./interfaces/note.repository.interface";
import { IPaginatedResult, IPaginationQuery } from "../types/pagination.interface";
import { NoteModel } from "../models/note.model";

export class NoteRepository extends BaseRepository<INoteDocument> implements INoteRepository {
  constructor() {
    super(NoteModel);
  }

  public async findByUserId(userId: string, pagination: IPaginationQuery): Promise<IPaginatedResult<INoteDocument>> {
    return this.findAll({ userId: new Types.ObjectId(userId) }, pagination, { createdAt: -1 });
  }

  public async findByIdAndUserId(id: string, userId: string): Promise<INoteDocument | null> {
    return this.model.findOne({ _id: id, userId: new Types.ObjectId(userId) }).exec();
  }
}

