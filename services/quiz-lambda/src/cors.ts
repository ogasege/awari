/**
 * CORS headers for the quiz service. Only origins on the allow-list get
 * an `Access-Control-Allow-Origin`; everyone else gets none, so browsers
 * on other sites cannot read the response.
 */

/** Splits the comma-separated `ALLOWED_ORIGINS` setting. */
export function parseOrigins(setting: string | undefined): string[] {
  return (setting ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter((o) => o !== '');
}

/** Headers to add to every response for a request from `origin`. */
export function corsHeaders(
  origin: string | undefined,
  allowed: readonly string[],
): Record<string, string> {
  if (origin === undefined || !allowed.includes(origin)) {
    return { vary: 'Origin' };
  }
  return {
    vary: 'Origin',
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-amz-content-sha256',
    'access-control-max-age': '600',
  };
}
