import { Request, Response, NextFunction } from "express";
import { JwtService, JwtPayload } from "../config/jwt";
import { HttpError } from "../error/http-error";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    throw new HttpError(401, "Token de acesso requerido");
  }

  try {
    const decoded = JwtService.verify(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new HttpError(403, "Token inválido");
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = JwtService.verify(token);
      req.user = decoded;
    } catch (error) {
      // Token inválido, mas não bloqueia a requisição
    }
  }

  next();
};
