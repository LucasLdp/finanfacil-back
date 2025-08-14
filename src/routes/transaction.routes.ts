import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";
import { validate } from "../middlewares/validation.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionByIdSchema,
  deleteTransactionSchema,
  getTransactionsByDateRangeSchema,
} from "../schemas/transaction.schema";

const router: Router = Router();
const transactionController = new TransactionController();

/**
 * @route POST /transactions
 * @description Criar uma nova transação
 * @body {description: string, amount: number, type: 'income' | 'expense'}
 * @header {string} Authorization - Bearer token
 */
router.post(
  "/",
  authenticateToken,
  validate(createTransactionSchema),
  transactionController.create
);

/**
 * @route GET /transactions
 * @description Listar transações do usuário com filtros e paginação
 * @query {string} startDate - Data de início (opcional)
 * @query {string} endDate - Data de fim (opcional)
 * @query {string} type - Tipo da transação: 'income' ou 'expense' (opcional)
 * @query {string} page - Página (opcional, padrão: 1)
 * @query {string} limit - Limite por página (opcional, padrão: 10)
 * @header {string} Authorization - Bearer token
 */
router.get(
  "/",
  authenticateToken,
  validate(getTransactionsByDateRangeSchema),
  transactionController.getAll
);

/**
 * @route GET /transactions/summary
 * @description Obter resumo das transações (receitas, despesas, saldo)
 * @query {string} startDate - Data de início (opcional)
 * @query {string} endDate - Data de fim (opcional)
 * @header {string} Authorization - Bearer token
 */
router.get("/summary", authenticateToken, transactionController.getSummary);

/**
 * @route GET /transactions/financial-health
 * @description Obter saúde financeira (porcentagem, status, receitas, despesas)
 * @header {string} Authorization - Bearer token
 */
router.get(
  "/financial-health",
  authenticateToken,
  transactionController.getFinancialHealth
);

/**
 * @route GET /transactions/:id
 * @description Buscar transação por ID
 * @param {string} id - ID da transação
 * @header {string} Authorization - Bearer token
 */
router.get(
  "/:id",
  authenticateToken,
  validate(getTransactionByIdSchema),
  transactionController.getById
);

/**
 * @route PUT /transactions/:id
 * @description Atualizar transação por ID
 * @param {string} id - ID da transação
 * @body {description?: string, amount?: number, type?: 'income' | 'expense'}
 * @header {string} Authorization - Bearer token
 */
router.put(
  "/:id",
  authenticateToken,
  validate(updateTransactionSchema),
  transactionController.update
);

/**
 * @route DELETE /transactions/:id
 * @description Deletar transação por ID
 * @param {string} id - ID da transação
 * @header {string} Authorization - Bearer token
 */
router.delete(
  "/:id",
  authenticateToken,
  validate(deleteTransactionSchema),
  transactionController.delete
);

export default router;
