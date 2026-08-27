import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RoleKey } from './roles';

const JWT_SECRET = process.env.JWT_SECRET as string;

export type SessionUser = { id: string; email: string; name: string; role: RoleKey };

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}
export async function checkPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
export function signSession(user: SessionUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });
}
export function verifySession(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}
