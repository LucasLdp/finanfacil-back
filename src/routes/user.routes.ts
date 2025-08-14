import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
  updateUserSchema,
  getUserByIdSchema,
  deleteUserSchema,
} from "../schemas/user.schema";

const router: Router = Router();
const userController = new UserController();

/**
 * @route GET /users
 * @description Listar todos os usuários (protegido)
 * @header {string} Authorization - Bearer token
 */
router.get("/", authenticateToken, userController.getAll);

/**
 * @route GET /users/:id
 * @description Buscar usuário por ID (protegido)
 * @param {string} id - ID do usuário
 * @header {string} Authorization - Bearer token
 */
router.get(
  "/:id",
  authenticateToken,
  validate(getUserByIdSchema),
  userController.getById
);

/**
 * @route PUT /users/:id
 * @description Atualizar usuário por ID (protegido)
 * @param {string} id - ID do usuário
 * @body {name?: string, email?: string, password?: string}
 * @header {string} Authorization - Bearer token
 */
router.put(
  "/:id",
  authenticateToken,
  validate(updateUserSchema),
  userController.update
);

/**
 * @route DELETE /users/:id
 * @description Deletar usuário por ID (protegido)
 * @param {string} id - ID do usuário
 * @header {string} Authorization - Bearer token
 */
router.delete(
  "/:id",
  authenticateToken,
  validate(deleteUserSchema),
  userController.delete
);

export default router;
