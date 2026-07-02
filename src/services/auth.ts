import {
  AuthUser,
  clearSession,
  getAccessToken,
  setSession,
} from "@/lib/auth";
import { UserRole } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8000";

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

async function parseError(res: Response, action: string): Promise<never> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { detail?: string };
    if (typeof json.detail === "string") {
      throw new Error(json.detail);
    }
  } catch (error) {
    if (error instanceof Error && !error.message.includes("failed (")) {
      throw error;
    }
  }
  throw new Error(`${action} failed (${res.status}): ${text}`);
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) await parseError(res, "Connexion");
  const data: TokenResponse = await res.json();
  setSession(data.access_token, data.user);
  return data;
}

export async function register(
  email: string,
  password: string,
  role: UserRole
): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  if (!res.ok) await parseError(res, "Inscription");
  const data: TokenResponse = await res.json();
  setSession(data.access_token, data.user);
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Connexion requise.");
  }

  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) await parseError(res, "Profil");
  return res.json();
}

export function logout(): void {
  clearSession();
}
