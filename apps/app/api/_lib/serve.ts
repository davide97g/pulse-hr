export type WebHandler = (request: Request) => Promise<Response> | Response;

/**
 * Vercel Node serverless expects the Web Standard shape `export default { fetch }`,
 * not `export default async function (...)`. A bare function default can fail at
 * runtime and surface as 500 for every /api/* call.
 */
export function serve(handler: WebHandler): { fetch: WebHandler } {
  return { fetch: handler };
}
