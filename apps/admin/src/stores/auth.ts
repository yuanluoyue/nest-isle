const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const REMEMBER_KEY = 'remember_password';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function saveRememberPassword(username: string, password: string): void {
  localStorage.setItem(REMEMBER_KEY, JSON.stringify({ username, password }));
}

export function getRememberPassword(): { username: string; password: string } | null {
  const data = localStorage.getItem(REMEMBER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearRememberPassword(): void {
  localStorage.removeItem(REMEMBER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
