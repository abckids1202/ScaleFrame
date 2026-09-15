export function jsonResponse(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  headers.set("content-security-policy", "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; connect-src 'self' https://*.supabase.co https://accounts.google.com");
  return Response.json(data, { ...init, headers });
}

export function errorResponse(message: string, status = 400, code = "bad_request") {
  return jsonResponse({ error: { code, message } }, { status });
}

export function safeText(value: unknown, max = 5000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export function csrfCookieFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("sf_csrf="));
  return match ? decodeURIComponent(match.slice("sf_csrf=".length)) : "";
}

export function validCsrf(request: Request) {
  const cookie = csrfCookieFromRequest(request);
  const header = request.headers.get("x-csrf-token") || "";
  return Boolean(cookie && header && cookie === header);
}

export function csrfCookie(token: string) {
  return `sf_csrf=${encodeURIComponent(token)}; Path=/; Max-Age=7200; SameSite=Lax; Secure`;
}
