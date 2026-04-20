import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readdirSync, statSync } from "node:fs";
import type { Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

const here = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(here, "..", "api");

type Route = {
  pattern: RegExp;
  file: string;
};

function buildRouteTable(): Route[] {
  if (!existsSync(apiRoot)) return [];
  const out: Route[] = [];

  const walk = (dir: string, urlPrefix: string) => {
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith("_")) continue;
      const full = resolve(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        const segment = entry.startsWith("[") && entry.endsWith("]") ? "([^/]+)" : entry;
        walk(full, `${urlPrefix}/${segment}`);
        continue;
      }
      if (!entry.endsWith(".ts") && !entry.endsWith(".js")) continue;
      const base = entry.replace(/\.(ts|js)$/, "");
      const urlSegment =
        base === "index" ? "" : base.startsWith("[") && base.endsWith("]") ? "/([^/]+)" : `/${base}`;
      const url = `${urlPrefix}${urlSegment}`;
      const pattern = new RegExp(`^${url}/?$`);
      out.push({ pattern, file: full });
    }
  };

  walk(apiRoot, "/api");
  return out;
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

  const method = req.method ?? "GET";
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

export function apiDevServer(): Plugin {
  let server: ViteDevServer | null = null;
  let routes: Route[] = [];

  return {
    name: "pulse-api-dev",
    apply: "serve",
    configureServer(s) {
      server = s;
      routes = buildRouteTable();
      if (routes.length === 0) {
        console.warn("[api-dev] no endpoints discovered under api/");
      }
      s.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api")) {
          next();
          return;
        }
        const pathname = url.split("?")[0];
        const match = routes.find((r) => r.pattern.test(pathname));
        if (!match) {
          res.statusCode = 404;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify({ error: { code: "not_found", message: pathname } }));
          return;
        }
        try {
          const mod = (await server!.ssrLoadModule(match.file)) as {
            default?: (request: Request) => Promise<Response> | Response;
          };
          if (typeof mod.default !== "function") {
            throw new Error(`handler has no default export: ${match.file}`);
          }
          const webReq = await nodeToWebRequest(req);
          const webRes = await mod.default(webReq);
          await sendWebResponse(res, webRes);
        } catch (err) {
          console.error("[api-dev]", pathname, err);
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(
            JSON.stringify({
              error: {
                code: "dev_error",
                message: err instanceof Error ? err.message : String(err),
              },
            }),
          );
        }
      });
    },
    handleHotUpdate({ file }) {
      if (!server) return;
      if (file.startsWith(apiRoot)) {
        routes = buildRouteTable();
      }
    },
  };
}
