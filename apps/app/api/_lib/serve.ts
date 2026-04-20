import type { IncomingMessage, ServerResponse } from "node:http";

export type WebHandler = (request: Request) => Promise<Response> | Response;

/**
 * Vercel's Node runtime invokes default-exported API functions with
 * `(req: IncomingMessage, res: ServerResponse)`, not a Web `Request`.
 * This adapter converts the Node req → Web `Request`, runs the
 * user-supplied Web handler, then streams the `Response` back onto `res`.
 *
 * The dev-mode `apiDevServer` plugin also detects a function default export
 * and calls it with a Web `Request` directly — that branch short-circuits
 * via the `request instanceof Request` check.
 */
export function serve(handler: WebHandler) {
  return async function nodeHandler(
    req: IncomingMessage | Request,
    res?: ServerResponse,
  ): Promise<Response | void> {
    if (req instanceof Request) {
      return handler(req);
    }
    const webReq = await nodeToWebRequest(req);
    const webRes = await handler(webReq);
    if (!res) return webRes;
    await sendWebResponse(res, webRes);
  };
}

async function nodeToWebRequest(req: IncomingMessage): Promise<Request> {
  const host = req.headers.host ?? "localhost";
  const protocol =
    (req.headers["x-forwarded-proto"] as string | undefined) ??
    ("encrypted" in (req.socket ?? {}) && (req.socket as { encrypted?: boolean }).encrypted
      ? "https"
      : "http");
  const url = `${protocol}://${host}${req.url ?? "/"}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else if (typeof value === "string") {
      headers.set(key, value);
    }
  }

  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") {
    return new Request(url, { method, headers });
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req as AsyncIterable<Buffer | string>) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const body = Buffer.concat(chunks);
  return new Request(url, { method, headers, body });
}

async function sendWebResponse(res: ServerResponse, webRes: Response): Promise<void> {
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  if (webRes.body) {
    const buffer = Buffer.from(await webRes.arrayBuffer());
    res.end(buffer);
  } else {
    res.end();
  }
}
