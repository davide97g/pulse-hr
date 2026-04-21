/**
 * Thin wrapper around `fetch` for calling the Pulse HR backend (apps/api on
 * Render). Prefixes every path with `VITE_API_BASE_URL` and attaches the
 * Clerk bearer when a token is supplied.
 *
 * In dev, set `VITE_API_BASE_URL=http://localhost:3000` in `apps/app/.env`.
 * In Vercel, set it to the Render service URL (e.g. `https://pulse-api.onrender.com`).
 */

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
}

/**
 * Fetch with the backend base URL + bearer token. `token` is usually from
 * `useAuth().getToken()` (Clerk). Pass `null` / `undefined` for public routes.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
  token?: string | null,
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  return fetch(apiUrl(path), { ...init, headers });
}
