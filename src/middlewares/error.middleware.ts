import { Request, Response, NextFunction } from "express";
import { HttpError } from "../error/http-error";
import { ZodError } from "zod";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      statusCode: error.statusCode,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Dados de entrada inválidos",
      errors: error.issues,
      statusCode: 400,
    });
    return;
  }

  if (error.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Token inválido",
      statusCode: 401,
    });
    return;
  }

  if (error.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expirado",
      statusCode: 401,
    });
    return;
  }

  console.error("Erro interno do servidor:", error);

  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    statusCode: 500,
  });
};
