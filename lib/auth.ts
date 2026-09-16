import { env } from "cloudflare:workers";
import { createRouteSupabaseClient } from "./supabase";
import { getDb } from "../db";
import { accounts } from "../db/schema";
import { eq } from "drizzle-orm";

export type CurrentUser = { subject: string; email: string | null; emailVerified: boolean; role: "user" | "reviewer" | "moderator" | "admin"; authenticated: boolean };
type JwtPayload = { sub?: string; email?: string; email_verified?: boolean; role?: string; exp?: number; aud?: string; iss?: string };
type Jwk = JsonWebKey & { kid?: string; alg?: string; use?: string };

export async function getCurrentUser(request: Request): Promise<CurrentUser | null> {
  try {
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      const { client } = createRouteSupabaseClient(request);
      const { data } = await client.auth.getUser();
      if (data.user) {
        let role: CurrentUser["role"] = "user";
        try { const account = (await getDb().select({ role: accounts.role, deletedAt: accounts.deletedAt }).from(accounts).where(eq(accounts.id, data.user.id)).limit(1))[0]; if (account?.deletedAt) return null; if (account?.role === "reviewer" || account?.role === "moderator" || account?.role === "admin") role = account.role; } catch { /* auth remains available while D1 is unavailable */ }
        return { subject: data.user.id, email: data.user.email ?? null, emailVerified: Boolean(data.user.email_confirmed_at), role, authenticated: true };
      }
    }
  } catch { /* fall through to bearer verification for service/API clients */ }
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const payload = await verifySupabaseJwt(authorization.slice(7).trim());
  if (!payload?.sub) return null;
  try { const account = (await getDb().select({ deletedAt: accounts.deletedAt }).from(accounts).where(eq(accounts.id, payload.sub)).limit(1))[0]; if (account?.deletedAt) return null; } catch { /* bearer verification remains usable while D1 is unavailable */ }
  return { subject: payload.sub, email: payload.email ?? null, emailVerified: Boolean(payload.email_verified), role: payload.role === "admin" || payload.role === "moderator" || payload.role === "reviewer" ? payload.role : "user", authenticated: true };
}

async function verifySupabaseJwt(token: string): Promise<JwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  let header: { alg?: string; kid?: string }; let payload: JwtPayload;
  try { header = JSON.parse(base64UrlDecode(encodedHeader)) as { alg?: string; kid?: string }; payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload; } catch { return null; }
  if (header.alg !== "RS256" || !payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
  const issuer = env.SUPABASE_JWT_ISSUER || (env.SUPABASE_URL ? `${env.SUPABASE_URL}/auth/v1` : "");
  const jwksUrl = env.SUPABASE_JWKS_URL || (env.SUPABASE_URL ? `${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json` : "");
  if (!issuer || !jwksUrl || (payload.iss && payload.iss !== issuer)) return null;
  if (payload.aud && payload.aud !== "authenticated") return null;
  const response = await fetch(jwksUrl, { cf: { cacheTtl: 3600 } });
  if (!response.ok) return null;
  const keySet = (await response.json()) as { keys?: Jwk[] };
  const key = keySet.keys?.find((candidate) => candidate.kid === header.kid);
  if (!key) return null;
  const cryptoKey = await crypto.subtle.importKey("jwk", key, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const signature = base64UrlBytes(encodedSignature); const signatureBuffer = signature.buffer.slice(signature.byteOffset, signature.byteOffset + signature.byteLength) as ArrayBuffer; const signedData = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`); const valid = await crypto.subtle.verify({ name: "RSASSA-PKCS1-v1_5" }, cryptoKey, signatureBuffer, signedData);
  return valid ? payload : null;
}

function base64UrlDecode(value: string): string { return new TextDecoder().decode(base64UrlBytes(value)); }
function base64UrlBytes(value: string): Uint8Array { const normalized = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "="); const binary = atob(normalized); return Uint8Array.from(binary, (char) => char.charCodeAt(0)); }
