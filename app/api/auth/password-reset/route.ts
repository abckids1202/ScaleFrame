import { errorResponse, jsonResponse, safeText, sameOrigin } from "../../../../lib/http";
import { enforceRateLimit, hashIdentifier } from "../../../../lib/security";
import { createRouteSupabaseClient, applySupabaseHeaders } from "../../../../lib/supabase";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Cross-origin request rejected.", 403, "origin_rejected");
  const payload = await request.json().catch(() => null) as { email?: unknown } | null; const email = safeText(payload?.email, 320).toLowerCase(); if (!email) return errorResponse("Email is required.");
  try { const limit = await enforceRateLimit(`auth_reset:${await hashIdentifier(email)}`, 5, 3600); if (!limit.allowed) return errorResponse("Too many recovery attempts. Try again later.", 429, "rate_limited"); const { client, responseHeaders } = createRouteSupabaseClient(request); await client.auth.resetPasswordForEmail(email, { redirectTo: `${new URL(request.url).origin}/auth/reset-password` }); return applySupabaseHeaders(jsonResponse({ accepted: true }), responseHeaders); } catch { return errorResponse("If that address exists, a recovery link will be sent.", 202, "accepted"); }
}
