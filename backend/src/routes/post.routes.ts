import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { createPostSchema, updatePostSchema } from "../validators/post.validator";
import { idParamSchema, paginationQuerySchema, userIdParamSchema } from "../validators/query.validator";

export const createPostRouter = (postController: PostController): Router => {
  const router = Router();

  router.post("/", authenticate, validate({ body: createPostSchema }), postController.createPost);
  router.get("/", validate({ query: paginationQuerySchema }), postController.getAllPosts);
  router.get("/user/:userId", validate({ params: userIdParamSchema }), postController.getPostsByUserId);
  router.get("/:id", validate({ params: idParamSchema }), postController.getPostById);
  router.put(
    "/:id",
    authenticate,
    validate({ params: idParamSchema, body: updatePostSchema }),
    postController.updatePost
  );
  router.delete("/:id", authenticate, validate({ params: idParamSchema }), postController.deletePost);

  return router;
};

