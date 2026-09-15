import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "cloudflare:workers";

export function getSupabaseConfig() {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase runtime configuration is missing.");
  return { url, key };
}

export function createRouteSupabaseClient(request: Request) {
  const { url, key } = getSupabaseConfig();
  const responseHeaders = new Headers();
  const client = createServerClient(url, key, {
    cookies: {
      getAll: () => parseCookies(request.headers.get("cookie") ?? ""),
      setAll: (cookiesToSet) => {
        for (const cookie of cookiesToSet) responseHeaders.append("set-cookie", serializeCookie(cookie.name, cookie.value, cookie.options));
      },
    },
    auth: { autoRefreshToken: false, persistSession: true, detectSessionInUrl: false },
  });
  return { client, responseHeaders };
}

export type RouteSupabaseClient = SupabaseClient;

function parseCookies(header: string): Array<{ name: string; value: string }> {
  return header.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const separator = part.indexOf("=");
    return separator < 0 ? { name: part, value: "" } : { name: part.slice(0, separator), value: decodeURIComponent(part.slice(separator + 1)) };
  });
}

function serializeCookie(name: string, value: string, options: Record<string, unknown> = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${String(options.path ?? "/")}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${String(options.maxAge)}`);
  if (options.domain) parts.push(`Domain=${String(options.domain)}`);
  if (options.httpOnly !== false) parts.push("HttpOnly");
  if (options.secure !== false) parts.push("Secure");
  const sameSite = options.sameSite;
  if (sameSite) parts.push(`SameSite=${String(sameSite).replace(/^./, (value) => value.toUpperCase())}`);
  return parts.join("; ");
}

export function combineHeaders(...headersList: Headers[]) {
  const combined = new Headers();
  for (const headers of headersList) headers.forEach((value, key) => combined.append(key, value));
  return combined;
}

export function applySupabaseHeaders(response: Response, responseHeaders: Headers) {
  responseHeaders.forEach((value, key) => response.headers.append(key, value));
  return response;
}
