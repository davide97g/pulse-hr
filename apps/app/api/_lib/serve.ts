export type WebHandler = (request: Request) => Promise<Response> | Response;

/**
 * Vercel Node serverless expects the default export to be a function with
 * the Web Standard signature `(request: Request) => Response`. Wrapping it
 * as `{ fetch }` (Cloudflare/Bun shape) causes FUNCTION_INVOCATION_FAILED.
 */
export function serve(handler: WebHandler): WebHandler {
  return handler;
}
