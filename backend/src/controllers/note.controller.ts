import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { INoteService } from "../services/interfaces/note.service.interface";

export class NoteController extends BaseController {
  constructor(private readonly noteService: INoteService) {
    super();
  }

  public createNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const note = await this.noteService.createNote(req.user!.userId, req.body);
      this.sendCreated(res, note, "Note created successfully");
    } catch (error) {
      next(error);
    }
  };

  public getNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const result = await this.noteService.getNotes(req.user!.userId, req.user!.role, { page, limit });
      this.sendPaginated(res, result, "Notes retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  public getNoteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const note = await this.noteService.getNoteById(req.params.id, req.user!.userId, req.user!.role);
      this.sendSuccess(res, note, "Note retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  public updateNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const note = await this.noteService.updateNote(
        req.params.id,
        req.user!.userId,
        req.user!.role,
        req.body
      );
      this.sendSuccess(res, note, "Note updated successfully");
    } catch (error) {
      next(error);
    }
  };

  public deleteNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.noteService.deleteNote(req.params.id, req.user!.userId, req.user!.role);
      this.sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

