import { UserRole } from "@/types";

const TOKEN_KEY = "intrabot_access_token";
const USER_KEY = "intrabot_user";
const ADMIN_API_KEY = "intrabot_admin_api_key";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(accessToken: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken() && getCurrentUser());
}

export function isAdminUser(): boolean {
  return getCurrentUser()?.role === "admin";
}

export function getAdminApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_API_KEY);
}

export function setAdminApiKey(apiKey: string): void {
  sessionStorage.setItem(ADMIN_API_KEY, apiKey);
}

export function clearAdminApiKey(): void {
  sessionStorage.removeItem(ADMIN_API_KEY);
}

export function isAdminAuthenticated(): boolean {
  return isAdminUser() || Boolean(getAdminApiKey());
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Connexion requise.");
  }

  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

export function adminHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAccessToken();
  const user = getCurrentUser();

  if (token && user?.role === "admin") {
    return {
      Authorization: `Bearer ${token}`,
      ...extra,
    };
  }

  const apiKey = getAdminApiKey();
  if (apiKey) {
    return {
      "X-API-Key": apiKey,
      ...extra,
    };
  }

  throw new Error("Accès administrateur requis.");
}
