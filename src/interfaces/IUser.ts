export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUser {
  name: string;
  email: string;
  password: string;
}

export interface IUpdateUser {
  name?: string;
  email?: string;
  password?: string;
}
