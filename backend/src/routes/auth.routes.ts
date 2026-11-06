import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router();

  router.post("/register", validate({ body: registerSchema }), authController.register);
  router.post("/login", validate({ body: loginSchema }), authController.login);
  router.get("/me", authenticate, authController.getMe);

  return router;
};

