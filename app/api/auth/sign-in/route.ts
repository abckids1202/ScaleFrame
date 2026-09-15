import { errorResponse, jsonResponse, safeText, sameOrigin } from "../../../../lib/http";
import { enforceRateLimit, hashIdentifier } from "../../../../lib/security";
import { syncAccount } from "../../../../lib/accounts";
import { applySupabaseHeaders, createRouteSupabaseClient } from "../../../../lib/supabase";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Cross-origin request rejected.", 403, "origin_rejected");
  const payload = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  const email = safeText(payload?.email, 320).toLowerCase(); const password = typeof payload?.password === "string" ? payload.password : "";
  if (!email || !password) return errorResponse("Email and password are required.");
  try { const limit = await enforceRateLimit(`auth_signin:${await hashIdentifier(email)}`, 12, 900); if (!limit.allowed) return errorResponse("Too many sign-in attempts. Try again later.", 429, "rate_limited"); } catch { return errorResponse("Authentication is temporarily unavailable.", 503, "auth_unavailable"); }
  try { const { client, responseHeaders } = createRouteSupabaseClient(request); const { data, error } = await client.auth.signInWithPassword({ email, password }); if (error || !data.user) return errorResponse("Email or password is incorrect.", 401, "invalid_credentials"); await syncAccount({ id: data.user.id, email: data.user.email, email_confirmed_at: data.user.email_confirmed_at }); const response = jsonResponse({ user: { id: data.user.id, email: data.user.email }, authenticated: true }); return applySupabaseHeaders(response, responseHeaders); }
  catch { return errorResponse("Authentication is temporarily unavailable.", 503, "auth_unavailable"); }
}
