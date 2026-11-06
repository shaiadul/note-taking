import { INoteDocument } from "../../types/note.interface";
import { IPaginatedResult, IPaginationQuery } from "../../types/pagination.interface";
import { CreateNoteDTO, UpdateNoteDTO } from "../../validators/note.validator";
import { UserRole } from "../../constants/roles.enum";

export interface INoteService {
  createNote(userId: string, dto: CreateNoteDTO): Promise<INoteDocument>;
  getNoteById(id: string, userId: string, role: UserRole): Promise<INoteDocument>;
  getNotes(userId: string, role: UserRole, pagination: IPaginationQuery): Promise<IPaginatedResult<INoteDocument>>;
  updateNote(id: string, userId: string, role: UserRole, dto: UpdateNoteDTO): Promise<INoteDocument>;
  deleteNote(id: string, userId: string, role: UserRole): Promise<void>;
}

