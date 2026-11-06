import { Router } from "express";
import { AggregationController } from "../controllers/aggregation.controller";
import { validate } from "../middlewares/validation.middleware";
import { userIdParamSchema } from "../validators/query.validator";

export const createAggregationRouter = (aggregationController: AggregationController): Router => {
  const router = Router();

  router.get("/group-by-interests", aggregationController.getUsersByInterests);
  router.get("/user/:userId/posts", validate({ params: userIdParamSchema }), aggregationController.getUserPosts);
  router.get(
    "/user/:userId/profile-with-posts",
    validate({ params: userIdParamSchema }),
    aggregationController.getUserWithPosts
  );

  return router;
};

