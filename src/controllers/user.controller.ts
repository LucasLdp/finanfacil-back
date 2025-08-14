import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { prisma } from "../lib/prisma";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService(prisma);
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUser = await this.userService.createUser(req.body);

      const { password, ...userWithoutPassword } = newUser;

      return res.status(201).json({
        message: "Usuário criado com sucesso",
        data: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "Usuário não encontrado",
        });
      }

      const { password, ...userWithoutPassword } = user;

      return res.status(200).json({
        message: "Usuário encontrado com sucesso",
        data: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();

      const usersWithoutPassword = users.map(({ password, ...user }) => user);

      return res.status(200).json({
        message: "Usuários listados com sucesso",
        data: usersWithoutPassword,
        total: usersWithoutPassword.length,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedUser = await this.userService.updateUser(
        req.params.id,
        req.body
      );

      const { password, ...userWithoutPassword } = updatedUser;

      return res.status(200).json({
        message: "Usuário atualizado com sucesso",
        data: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.userService.deleteUser(req.params.id);

      return res.status(200).json({
        message: "Usuário deletado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  };
}
