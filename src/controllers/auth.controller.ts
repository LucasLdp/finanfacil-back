import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login({ email, password });

      res.status(200).json({
        success: true,
        message: "Login realizado com sucesso",
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, email, password } = req.body;

      const result = await AuthService.register({ name, email, password });

      res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso",
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        });
        return;
      }

      const user = await AuthService.getProfile(req.user.userId);

      res.status(200).json({
        success: true,
        message: "Perfil do usuário recuperado com sucesso",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Token inválido",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Token válido",
        data: {
          userId: req.user.userId,
          email: req.user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
