export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...init.headers,
    },
  });
}

export function err(status: number, code: string, message?: string): Response {
  return json({ error: { code, message: message ?? code } }, { status });
}

export function badRequest(message: string): Response {
  return err(400, "bad_request", message);
}

export function unauthorized(): Response {
  return err(401, "unauthorized");
}

export function forbidden(): Response {
  return err(403, "forbidden");
}

export function notFound(what = "not found"): Response {
  return err(404, "not_found", what);
}

export function methodNotAllowed(allowed: string[]): Response {
  return new Response(JSON.stringify({ error: { code: "method_not_allowed" } }), {
    status: 405,
    headers: { "content-type": "application/json", allow: allowed.join(", ") },
  });
}

export function serverError(error: unknown): Response {
  const message = error instanceof Error ? error.message : "unknown";
  console.error("api error:", error);
  return err(500, "server_error", message);
}
