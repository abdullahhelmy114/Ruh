// lib/authFetch.ts
import { getAuth } from "firebase/auth";

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const auth = getAuth();
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // لا نضبط Content-Type إذا كان الطلب يحوي FormData
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, { ...options, headers });
}