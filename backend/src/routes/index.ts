import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";
import { NoteController } from "../controllers/note.controller";
import { PostController } from "../controllers/post.controller";
import { AggregationController } from "../controllers/aggregation.controller";
import { createAuthRouter } from "./auth.routes";
import { createUserRouter } from "./user.routes";
import { createNoteRouter } from "./note.routes";
import { createPostRouter } from "./post.routes";
import { createAggregationRouter } from "./aggregation.routes";

export interface AppControllers {
  authController: AuthController;
  userController: UserController;
  noteController: NoteController;
  postController: PostController;
  aggregationController: AggregationController;
}

export const createApiRouter = (controllers: AppControllers): Router => {
  const router = Router();

  router.use("/auth", createAuthRouter(controllers.authController));
  router.use("/users", createUserRouter(controllers.userController));
  router.use("/notes", createNoteRouter(controllers.noteController));
  router.use("/posts", createPostRouter(controllers.postController));
  router.use("/aggregations", createAggregationRouter(controllers.aggregationController));

  return router;
};

