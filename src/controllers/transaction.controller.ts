import { Response, NextFunction } from "express";
import { TransactionService } from "../services/transaction.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class TransactionController {
  async create(
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

      const { description, amount, type, createdAt } = req.body;

      const transaction = await TransactionService.create({
        userId: req.user.userId,
        description,
        amount,
        type,
        createdAt,
      });

      res.status(201).json({
        success: true,
        message: "Transação criada com sucesso",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(
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

      const { id } = req.params;

      const transaction = await TransactionService.getById(id, req.user.userId);

      res.status(200).json({
        success: true,
        message: "Transação encontrada",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(
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

      const { startDate, endDate, type, page = "1", limit = "10" } = req.query;

      const filters = {
        userId: req.user.userId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        type: type as "income" | "expense" | undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      };

      const result = await TransactionService.getAll(filters);

      res.status(200).json({
        success: true,
        message: "Transações encontradas",
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
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

      const { id } = req.params;
      const updateData = req.body;

      const transaction = await TransactionService.update(
        id,
        req.user.userId,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "Transação atualizada com sucesso",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(
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

      const { id } = req.params;

      const result = await TransactionService.delete(id, req.user.userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(
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

      const { startDate, endDate } = req.query;

      const summary = await TransactionService.getSummary(
        req.user.userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        message: "Resumo das transações",
        results: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByDateRange(
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

      const { startDate, endDate, type } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: "Data de início e fim são obrigatórias",
        });
        return;
      }

      const transactions = await TransactionService.getByDateRange(
        req.user.userId,
        new Date(startDate as string),
        new Date(endDate as string),
        type as "income" | "expense" | undefined
      );

      res.status(200).json({
        success: true,
        message: "Transações encontradas no período",
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFinancialHealth(
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

      const healthData = await TransactionService.getFinancialHealth(
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: "Saúde financeira calculada",
        results: healthData,
      });
    } catch (error) {
      next(error);
    }
  }
}
