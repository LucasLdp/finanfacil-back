import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string({
        message: "Nome é obrigatório",
      })
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    email: z
      .email("Email deve ter um formato válido")
      .max(255, "Email deve ter no máximo 255 caracteres"),
    password: z
      .string({
        message: "Senha é obrigatória",
      })
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .max(100, "Senha deve ter no máximo 100 caracteres"),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres")
      .optional(),
    email: z
      .email("Email deve ter um formato válido")
      .max(255, "Email deve ter no máximo 255 caracteres")
      .optional(),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .max(100, "Senha deve ter no máximo 100 caracteres")
      .optional(),
  }),
  params: z.object({
    id: z.string({
      message: "ID é obrigatório",
    }),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string({
      message: "ID é obrigatório",
    }),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string({
      message: "ID é obrigatório",
    }),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
