export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarLetter: string;
  loggedInAt: string;
}

const STORAGE_KEY = 'pharma_ai_auth_user';

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch (err) {
    console.error('Failed to read auth user from storage', err);
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    // Set a lightweight cookie so server requests or route handlers can also inspect if needed
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=604800; SameSite=Lax`;
  } catch (err) {
    console.error('Failed to persist auth user', err);
  }
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch (err) {
    console.error('Failed to clear auth user', err);
  }
}

export function buildUserFromEmail(email: string, name?: string): AuthUser {
  const cleanEmail = email.trim().toLowerCase();
  const derivedName = name?.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Researcher';
  const avatarLetter = derivedName.charAt(0).toUpperCase() || 'R';
  const id = 'usr_' + Math.random().toString(36).substring(2, 9);

  return {
    id,
    name: derivedName,
    email: cleanEmail,
    role: 'Clinical Research Analyst',
    avatarLetter,
    loggedInAt: new Date().toISOString(),
  };
}
