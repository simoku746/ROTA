import { cookies } from 'next/headers';
import { verifySession } from './auth';

export function getSession() {
  const token = cookies().get('rota_session')?.value;
  if (!token) return null;
  return verifySession(token);
}
