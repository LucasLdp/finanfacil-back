import { PrismaClient } from "@prisma/client";
import { ConflictError } from "../error/http-error";

import { IUser, ICreateUser, IUpdateUser } from "../interfaces/IUser";
import bcrypt from "bcryptjs";

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async createUser(data: ICreateUser): Promise<IUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) throw new ConflictError("Email já cadastrado");

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const createdUser = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
    return createdUser;
  }

  async getUserById(id: string): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  async getAllUsers(): Promise<IUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return users;
  }

  async updateUser(id: string, data: IUpdateUser): Promise<IUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new ConflictError("Usuário não encontrado");
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new ConflictError("Email já está em uso");
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new ConflictError("Usuário não encontrado");
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }
}
