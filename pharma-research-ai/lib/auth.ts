import { createHmac } from 'node:crypto';
import { cookies } from 'next/headers';

const secret = process.env.AUTH_SECRET ?? 'local-pharma-research-secret';
export function createSession(userId: string) { return `${userId}.${createHmac('sha256', secret).update(userId).digest('hex')}`; }
export function verifySession(value?: string) {
  if (!value) return null;
  const [userId, signature] = value.split('.');
  if (!userId || signature !== createHmac('sha256', secret).update(userId).digest('hex')) return null;
  return userId;
}
export async function getSessionUserId() { return verifySession((await cookies()).get('pharma_session')?.value); }