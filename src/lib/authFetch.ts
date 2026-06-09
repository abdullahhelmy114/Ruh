// src/lib/authFetch.ts
import { getAuth } from "firebase/auth";

/**
 * دالة fetch تلقائية ترسل رمز Firebase الحالي في رأس Authorization
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const auth = getAuth();
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, { ...options, headers });
}