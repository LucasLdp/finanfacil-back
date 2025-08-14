import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma";
import { JwtService } from "../config/jwt";
import { HttpError } from "../error/http-error";

const prisma = new PrismaClient();

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

export class AuthService {
  static async login(data: LoginInput): Promise<AuthResponse> {
    const { email, password } = data;

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpError(401, "Credenciais inválidas");
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpError(401, "Credenciais inválidas");
    }

    // Gerar token JWT
    const token = JwtService.sign({
      userId: user.id,
      email: user.email,
    });

    // Retornar dados do usuário (sem a senha) e token
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async register(data: RegisterInput): Promise<AuthResponse> {
    const { name, email, password } = data;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpError(409, "Email já está em uso");
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = JwtService.sign({
      userId: user.id,
      email: user.email,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async getProfile(
    userId: string
  ): Promise<Omit<AuthResponse["user"], "password">> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpError(404, "Usuário não encontrado");
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
