import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z.object({
    description: z
      .string()
      .min(1, "Descrição é obrigatória")
      .max(255, "Descrição deve ter no máximo 255 caracteres"),
    amount: z
      .number()
      .positive("Valor deve ser positivo")
      .min(0.01, "Valor mínimo é 0.01"),
    type: z.enum(["income", "expense"], {
      error: 'Tipo deve ser "income" ou "expense"',
    }),
    createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Data deve ser uma data válida no formato ISO",
    }),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID da transação é obrigatório"),
  }),
  body: z.object({
    description: z
      .string()
      .min(1, "Descrição é obrigatória")
      .max(255, "Descrição deve ter no máximo 255 caracteres")
      .optional(),
    amount: z
      .number()
      .positive("Valor deve ser positivo")
      .min(0.01, "Valor mínimo é 0.01")
      .optional(),
    type: z
      .enum(["income", "expense"], {
        error: 'Tipo deve ser "income" ou "expense"',
      })
      .optional(),
  }),
});

export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID da transação é obrigatório"),
  }),
});

export const deleteTransactionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "ID da transação é obrigatório"),
  }),
});

export const getTransactionsByDateRangeSchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Data de início deve ser uma data válida",
      })
      .optional(),
    endDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)), {
        message: "Data de fim deve ser uma data válida",
      })
      .optional(),
    type: z.enum(["income", "expense"]).optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, { message: "Página deve ser maior que 0" })
      .optional()
      .default(1),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0 && val <= 100, {
        message: "Limite deve ser entre 1 e 100",
      })
      .optional()
      .default(10),
  }),
});

export type CreateTransactionSchemaType = z.infer<
  typeof createTransactionSchema
>;
export type UpdateTransactionSchemaType = z.infer<
  typeof updateTransactionSchema
>;
export type GetTransactionByIdSchemaType = z.infer<
  typeof getTransactionByIdSchema
>;
export type DeleteTransactionSchemaType = z.infer<
  typeof deleteTransactionSchema
>;
export type GetTransactionsByDateRangeSchemaType = z.infer<
  typeof getTransactionsByDateRangeSchema
>;
