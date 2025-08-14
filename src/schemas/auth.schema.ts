import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Email deve ter um formato válido")
      .min(1, "Email é obrigatório"),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .min(1, "Senha é obrigatória"),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .min(1, "Nome é obrigatório"),
    email: z
      .string()
      .email("Email deve ter um formato válido")
      .min(1, "Email é obrigatório"),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .min(1, "Senha é obrigatória"),
  }),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
