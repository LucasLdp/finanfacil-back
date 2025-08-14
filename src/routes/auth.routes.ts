import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

const router: Router = Router();
const authController = new AuthController();

/**
 * @route POST /auth/login
 * @description Realizar login do usuário
 * @body {email: string, password: string}
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @route POST /auth/register
 * @description Registrar novo usuário
 * @body {name: string, email: string, password: string}
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * @route GET /auth/profile
 * @description Obter perfil do usuário autenticado
 * @header {string} Authorization - Bearer token
 */
router.get("/profile", authenticateToken, authController.getProfile);

/**
 * @route GET /auth/verify
 * @description Verificar se o token é válido
 * @header {string} Authorization - Bearer token
 */
router.get("/verify", authenticateToken, authController.verifyToken);

export default router;
