import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validation.middleware";
import { UserRole } from "../constants/roles.enum";
import { createUserSchema, updateUserSchema } from "../validators/user.validator";
import { idParamSchema, paginationQuerySchema } from "../validators/query.validator";

export const createUserRouter = (userController: UserController): Router => {
  const router = Router();

  router.use(authenticate);

  router.post(
    "/",
    authorize(UserRole.ADMIN),
    validate({ body: createUserSchema }),
    userController.createUser
  );

  router.get(
    "/",
    authorize(UserRole.ADMIN),
    validate({ query: paginationQuerySchema }),
    userController.getAllUsers
  );

  router.get("/:id", validate({ params: idParamSchema }), userController.getUserById);

  router.put(
    "/:id",
    validate({ params: idParamSchema, body: updateUserSchema }),
    userController.updateUser
  );

  router.delete(
    "/:id",
    authorize(UserRole.ADMIN),
    validate({ params: idParamSchema }),
    userController.deleteUser
  );

  return router;
};

