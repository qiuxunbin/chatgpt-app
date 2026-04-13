import { api } from "./api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface AuthUser {
  id: number;
  username: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function loginApi(username: string, password: string): Promise<string> {
  const res = await api.post("/api/auth/login", { username, password });
  return res.data.access_token;
}

export async function registerApi(username: string, password: string): Promise<string> {
  const res = await api.post("/api/auth/register", { username, password });
  return res.data.access_token;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await api.get("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
