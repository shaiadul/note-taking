import { Router } from "express";
import { NoteController } from "../controllers/note.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { createNoteSchema, updateNoteSchema } from "../validators/note.validator";
import { idParamSchema, paginationQuerySchema } from "../validators/query.validator";

export const createNoteRouter = (noteController: NoteController): Router => {
  const router = Router();

  router.use(authenticate);

  router.post("/", validate({ body: createNoteSchema }), noteController.createNote);
  router.get("/", validate({ query: paginationQuerySchema }), noteController.getNotes);
  router.get("/:id", validate({ params: idParamSchema }), noteController.getNoteById);
  router.put(
    "/:id",
    validate({ params: idParamSchema, body: updateNoteSchema }),
    noteController.updateNote
  );
  router.delete("/:id", validate({ params: idParamSchema }), noteController.deleteNote);

  return router;
};

