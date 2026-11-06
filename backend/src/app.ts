import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { httpLogger } from "./middlewares/logger.middleware";
import { rateLimiter } from "./middlewares/rate-limiter.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { NotFoundError } from "./errors/app-error";
import { UserRepository } from "./repositories/user.repository";
import { NoteRepository } from "./repositories/note.repository";
import { PostRepository } from "./repositories/post.repository";
import { AuthService } from "./services/auth.service";
import { UserService } from "./services/user.service";
import { NoteService } from "./services/note.service";
import { PostService } from "./services/post.service";
import { AggregationService } from "./services/aggregation.service";
import { AuthController } from "./controllers/auth.controller";
import { UserController } from "./controllers/user.controller";
import { NoteController } from "./controllers/note.controller";
import { PostController } from "./controllers/post.controller";
import { AggregationController } from "./controllers/aggregation.controller";
import { createApiRouter } from "./routes";

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.use(httpLogger);
  app.use(rateLimiter);

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  const userRepository = new UserRepository();
  const noteRepository = new NoteRepository();
  const postRepository = new PostRepository();

  const authService = new AuthService(userRepository);
  const userService = new UserService(userRepository);
  const noteService = new NoteService(noteRepository);
  const postService = new PostService(postRepository, userRepository);
  const aggregationService = new AggregationService(userRepository, postRepository);

  const authController = new AuthController(authService);
  const userController = new UserController(userService);
  const noteController = new NoteController(noteService);
  const postController = new PostController(postService);
  const aggregationController = new AggregationController(aggregationService);

  const apiRouter = createApiRouter({
    authController,
    userController,
    noteController,
    postController,
    aggregationController
  });

  app.use("/api", apiRouter);

  app.use((_req: Request, _res: Response) => {
    throw new NotFoundError("Endpoint not found");
  });

  app.use(errorHandler);

  return app;
};

