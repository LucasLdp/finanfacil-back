import { PrismaClient } from "../generated/prisma";
import { HttpError } from "../error/http-error";

const prisma = new PrismaClient();

export interface CreateTransactionInput {
  userId: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  createdAt: string;
}

export interface UpdateTransactionInput {
  description?: string;
  amount?: number;
  type?: "income" | "expense";
}

export interface TransactionFilters {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  type?: "income" | "expense";
  page?: number;
  limit?: number;
}

export interface MonthlyAverage {
  month: string; // Formato: "2025-08" ou "August 2025"
  averageValue: number; // Valor médio das transações do mês
  totalTransactions: number;
}

export interface FinancialHealth {
  totalIncome: number; // Total de receitas
  totalExpenses: number; // Total de despesas
  percentage: number; // Porcentagem de saúde (0-100)
  status: "excellent" | "good" | "warning" | "critical"; // Status da saúde
  message: string; // Mensagem descritiva
}

export interface TransactionSummary {
  total: number;
  expenses: number;
  balance: number;
  history: any[];
  monthlyAverage: MonthlyAverage[];
}

export class TransactionService {
  static async create(data: CreateTransactionInput) {
    const { userId, description, amount, type, createdAt } = data;

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpError(404, "Usuário não encontrado");
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        description,
        amount,
        type,
        createdAt: new Date(createdAt),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return transaction;
  }

  static async getById(id: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId, // Garantir que o usuário só acesse suas próprias transações
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new HttpError(404, "Transação não encontrada");
    }

    return transaction;
  }

  static async getAll(filters: TransactionFilters) {
    const { userId, startDate, endDate, type, page = 1, limit = 10 } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async update(
    id: string,
    userId: string,
    data: UpdateTransactionInput
  ) {
    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTransaction) {
      throw new HttpError(404, "Transação não encontrada");
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...data,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return transaction;
  }

  static async delete(id: string, userId: string) {
    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTransaction) {
      throw new HttpError(404, "Transação não encontrada");
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return { message: "Transação deletada com sucesso" };
  }

  static async getSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TransactionSummary> {
    const where: any = {
      userId,
    };

    // Filtros por data
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [incomeData, expenseData, historico] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: "income" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: "expense" },
        _sum: { amount: true },
      }),
      // Buscar histórico de transações em ordem decrescente
      prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50, // Limitar a 50 transações mais recentes
      }),
    ]);

    const total = incomeData._sum.amount || 0;
    const expenses = expenseData._sum.amount || 0;
    const balance = total - expenses;

    // Calcular valor médio mensal
    const monthlyAverage = await this.calculateMonthlyAverages(
      userId,
      startDate,
      endDate
    );

    return {
      total,
      expenses,
      balance,
      history: historico,
      monthlyAverage,
    };
  }

  private static async calculateMonthlyAverages(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<MonthlyAverage[]> {
    // Buscar TODAS as transações do usuário (ou filtradas por data se especificado)
    const whereCondition: any = { userId };

    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) {
        whereCondition.createdAt.gte = startDate;
      }
      if (endDate) {
        whereCondition.createdAt.lte = endDate;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "asc",
      },
    });

    // Agrupar transações por mês baseado na data de cada transação
    const monthlyData: { [key: string]: { total: number; count: number } } = {};

    transactions.forEach((transaction) => {
      const monthKey = `${transaction.createdAt.getFullYear()}-${String(
        transaction.createdAt.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0 };
      }

      monthlyData[monthKey].total += transaction.amount;
      monthlyData[monthKey].count += 1;
    });

    // Converter para array e calcular médias apenas dos meses que têm transações
    const monthlyAverages: MonthlyAverage[] = Object.entries(monthlyData).map(
      ([month, data]) => {
        const [year, monthNum] = month.split("-");
        const monthNames = [
          "Janeiro",
          "Fevereiro",
          "Março",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro",
        ];

        return {
          month: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
          averageValue: data.total / data.count,
          totalTransactions: data.count,
        };
      }
    );

    // Ordenar por data (mais antigo primeiro - ordem crescente)
    return monthlyAverages.sort((a, b) => {
      // Extrair ano e mês para comparação correta
      const [monthA, yearA] = a.month.split(" ");
      const [monthB, yearB] = b.month.split(" ");

      const monthNamesForSort = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];

      const monthIndexA = monthNamesForSort.indexOf(monthA);
      const monthIndexB = monthNamesForSort.indexOf(monthB);

      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB);
      }
      return monthIndexA - monthIndexB;
    });
  }

  static async getByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: "income" | "expense"
  ) {
    const where: any = {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (type) {
      where.type = type;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return transactions;
  }

  static async getFinancialHealth(userId: string): Promise<FinancialHealth> {
    // Buscar todas as transações do usuário
    const [incomeData, expenseData] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: "income" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "expense" },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = incomeData._sum.amount || 0;
    const totalExpenses = expenseData._sum.amount || 0;

    // Calcular a porcentagem de saúde financeira
    let percentage = 0;
    let status: "excellent" | "good" | "warning" | "critical" = "critical";
    let message = "";

    if (totalIncome === 0) {
      // Sem receitas
      percentage = 0;
      status = "critical";
      message = "Nenhuma receita registrada. Comece a registrar suas entradas!";
    } else if (totalExpenses === 0) {
      // Só receitas, sem gastos
      percentage = 100;
      status = "excellent";
      message = "Excelente! Você tem receitas sem gastos registrados.";
    } else {
      // Calcular porcentagem baseada na relação receita/despesa
      const expenseRatio = totalExpenses / totalIncome;

      if (expenseRatio <= 0.5) {
        // Gastos até 50% da receita
        percentage = 100;
        status = "excellent";
        message =
          "Excelente controle financeiro! Seus gastos estão bem abaixo da sua receita.";
      } else if (expenseRatio <= 0.7) {
        // Gastos entre 50% e 70% da receita
        percentage = 80;
        status = "good";
        message =
          "Boa saúde financeira! Você está gastando de forma controlada.";
      } else if (expenseRatio <= 0.9) {
        // Gastos entre 70% e 90% da receita
        percentage = 60;
        status = "warning";
        message = "Atenção! Seus gastos estão altos em relação à sua receita.";
      } else if (expenseRatio <= 1.0) {
        // Gastos entre 90% e 100% da receita
        percentage = 30;
        status = "warning";
        message = "Cuidado! Você está gastando quase toda sua receita.";
      } else {
        // Gastos maiores que a receita
        percentage = 10;
        status = "critical";
        message = "Alerta crítico! Seus gastos excedem sua receita.";
      }
    }

    return {
      totalIncome,
      totalExpenses,
      percentage,
      status,
      message,
    };
  }
}
