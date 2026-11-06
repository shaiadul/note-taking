import { Types } from "mongoose";
import { INoteService } from "./interfaces/note.service.interface";
import { INoteRepository } from "../repositories/interfaces/note.repository.interface";
import { INoteDocument } from "../types/note.interface";
import { IPaginatedResult, IPaginationQuery } from "../types/pagination.interface";
import { CreateNoteDTO, UpdateNoteDTO } from "../validators/note.validator";
import { UserRole } from "../constants/roles.enum";
import { ForbiddenError, NotFoundError } from "../errors/app-error";

export class NoteService implements INoteService {
  constructor(private readonly noteRepository: INoteRepository) {}

  public async createNote(userId: string, dto: CreateNoteDTO): Promise<INoteDocument> {
    return this.noteRepository.create({
      title: dto.title,
      content: dto.content,
      userId: new Types.ObjectId(userId)
    });
  }

  public async getNoteById(id: string, userId: string, role: UserRole): Promise<INoteDocument> {
    const note = await this.noteRepository.findById(id);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    if (role !== UserRole.ADMIN && note.userId.toString() !== userId) {
      throw new ForbiddenError("Access denied: You can only view your own notes");
    }

    return note;
  }

  public async getNotes(
    userId: string,
    role: UserRole,
    pagination: IPaginationQuery
  ): Promise<IPaginatedResult<INoteDocument>> {
    if (role === UserRole.ADMIN) {
      return this.noteRepository.findAll({}, pagination, { createdAt: -1 });
    }
    return this.noteRepository.findByUserId(userId, pagination);
  }

  public async updateNote(
    id: string,
    userId: string,
    role: UserRole,
    dto: UpdateNoteDTO
  ): Promise<INoteDocument> {
    const note = await this.noteRepository.findById(id);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    if (role !== UserRole.ADMIN && note.userId.toString() !== userId) {
      throw new ForbiddenError("Access denied: You can only update your own notes");
    }

    const updated = await this.noteRepository.updateById(id, dto);
    if (!updated) {
      throw new NotFoundError("Note not found");
    }

    return updated;
  }

  public async deleteNote(id: string, userId: string, role: UserRole): Promise<void> {
    const note = await this.noteRepository.findById(id);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    if (role !== UserRole.ADMIN && note.userId.toString() !== userId) {
      throw new ForbiddenError("Access denied: You can only delete your own notes");
    }

    await this.noteRepository.deleteById(id);
  }
}

