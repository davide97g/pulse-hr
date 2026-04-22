/**
 * Thin wrapper around `fetch` for calling the Pulse HR backend (apps/api on
 * Render). Prefixes every path with `VITE_API_BASE_URL` and attaches the
 * Clerk bearer when a token is supplied.
 *
 * In dev, set `VITE_API_BASE_URL=http://localhost:3000` in `apps/app/.env`.
 * In Vercel, set it to the Render service URL (e.g. `https://pulse-api.onrender.com`).
 */

import { isOfflineMode } from "./offline-mode";

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
}

function offlineResponse(path: string): Response {
  return new Response(
    JSON.stringify({
      error: { code: "offline", message: "Offline preview — server unavailable." },
      path,
    }),
    {
      status: 503,
      headers: { "content-type": "application/json", "x-pulse-offline": "1" },
    },
  );
}

/**
 * Fetch with the backend base URL + bearer token. `token` is usually from
 * `useAuth().getToken()` (Clerk). Pass `null` / `undefined` for public routes.
 *
 * When the user has toggled "Continue offline" during a cold-start boot,
 * every call is short-circuited to a synthetic 503 so route code falls
 * through to its local table-backed data path instead of spinning on fetch.
 * The `/health` endpoint is exempt so the Retry banner can still wake the
 * server.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
  token?: string | null,
): Promise<Response> {
  if (isOfflineMode() && !path.startsWith("/health")) {
    return offlineResponse(path);
  }
  const headers = new Headers(init.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  return fetch(apiUrl(path), { ...init, headers });
}
