/**
 * Thin wrapper around `fetch` for calling the Pulse HR backend. Prefixes every
 * path with `VITE_API_BASE_URL` and attaches the Clerk bearer when supplied.
 */

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  token?: string | null,
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  return fetch(apiUrl(path), { ...init, headers });
}
