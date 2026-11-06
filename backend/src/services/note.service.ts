import { Types } from "mongoose";
import { INoteService } from "./interfaces/note.service.interface";
import { INoteRepository } from "../repositories/interfaces/note.repository.interface";
import { ICacheService } from "./interfaces/cache.service.interface";
import { INoteDocument } from "../types/note.interface";
import { IPaginatedResult, IPaginationQuery } from "../types/pagination.interface";
import { CreateNoteDTO, UpdateNoteDTO } from "../validators/note.validator";
import { UserRole } from "../constants/roles.enum";
import { ForbiddenError, NotFoundError } from "../errors/app-error";

export class NoteService implements INoteService {
  constructor(
    private readonly noteRepository: INoteRepository,
    private readonly cacheService: ICacheService
  ) {}

  public async createNote(userId: string, dto: CreateNoteDTO): Promise<INoteDocument> {
    const note = await this.noteRepository.create({
      title: dto.title,
      content: dto.content,
      userId: new Types.ObjectId(userId)
    });

    await this.invalidateNoteCache(userId);
    return note;
  }

  public async getNoteById(id: string, userId: string, role: UserRole): Promise<INoteDocument> {
    const cacheKey = `notes:item:${id}`;
    const cached = await this.cacheService.get<INoteDocument>(cacheKey);

    if (cached) {
      if (role !== UserRole.ADMIN && String(cached.userId) !== userId) {
        throw new ForbiddenError("Access denied: You can only view your own notes");
      }
      return cached;
    }

    const note = await this.noteRepository.findById(id);
    if (!note) {
      throw new NotFoundError("Note not found");
    }

    if (role !== UserRole.ADMIN && note.userId.toString() !== userId) {
      throw new ForbiddenError("Access denied: You can only view your own notes");
    }

    await this.cacheService.set(cacheKey, note, 300);
    return note;
  }

  public async getNotes(
    userId: string,
    role: UserRole,
    pagination: IPaginationQuery
  ): Promise<IPaginatedResult<INoteDocument>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const cacheKey =
      role === UserRole.ADMIN
        ? `notes:admin:p:${page}:l:${limit}`
        : `notes:user:${userId}:p:${page}:l:${limit}`;

    const cached = await this.cacheService.get<IPaginatedResult<INoteDocument>>(cacheKey);
    if (cached) {
      return cached;
    }

    const result =
      role === UserRole.ADMIN
        ? await this.noteRepository.findAll({}, pagination, { createdAt: -1 })
        : await this.noteRepository.findByUserId(userId, pagination);

    await this.cacheService.set(cacheKey, result, 300);
    return result;
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

    await this.invalidateNoteCache(userId, id);
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
    await this.invalidateNoteCache(userId, id);
  }

  private async invalidateNoteCache(userId: string, noteId?: string): Promise<void> {
    const operations: Promise<void>[] = [
      this.cacheService.deleteByPattern(`notes:user:${userId}:*`),
      this.cacheService.deleteByPattern("notes:admin:*")
    ];

    if (noteId) {
      operations.push(this.cacheService.delete(`notes:item:${noteId}`));
    }

    await Promise.all(operations);
  }
}
