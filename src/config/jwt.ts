import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key";

export interface JwtPayload {
  userId: string;
  email: string;
}

export class JwtService {
  static sign(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: "7d" };
    return jwt.sign(payload, JWT_SECRET, options);
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }
}
