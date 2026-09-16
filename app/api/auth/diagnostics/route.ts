import { env } from "cloudflare:workers";
import { getCurrentUser } from "../../../../lib/auth";
import { errorResponse, jsonResponse } from "../../../../lib/http";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user || !["reviewer", "moderator", "admin"].includes(user.role)) return errorResponse("Authentication diagnostics are restricted.", 403, "forbidden");
  return jsonResponse({ configured: { supabaseUrl: Boolean(env.SUPABASE_URL), anonKey: Boolean(env.SUPABASE_ANON_KEY), issuer: Boolean(env.SUPABASE_JWT_ISSUER), jwksUrl: Boolean(env.SUPABASE_JWKS_URL) }, session: { authenticated: true, emailVerified: user.emailVerified, role: user.role }, callbacks: { oauthPath: "/api/auth/callback", redirectPath: "/auth/callback" }, lastSafeErrorCategory: null });
}
