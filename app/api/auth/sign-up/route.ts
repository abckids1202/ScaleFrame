import { errorResponse, jsonResponse, safeText, sameOrigin } from "../../../../lib/http";
import { enforceRateLimit, hashIdentifier } from "../../../../lib/security";
import { applySupabaseHeaders, createRouteSupabaseClient } from "../../../../lib/supabase";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Cross-origin request rejected.", 403, "origin_rejected");
  const payload = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  const email = safeText(payload?.email, 320).toLowerCase(); const password = typeof payload?.password === "string" ? payload.password : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 10 || password.length > 128) return errorResponse("Use a valid email and a password between 10 and 128 characters.");
  try { const limit = await enforceRateLimit(`auth_signup:${await hashIdentifier(email)}`, 5, 3600); if (!limit.allowed) return errorResponse("Too many sign-up attempts. Try again later.", 429, "rate_limited"); } catch { return errorResponse("Authentication is temporarily unavailable.", 503, "auth_unavailable"); }
  try {
    const { client, responseHeaders } = createRouteSupabaseClient(request);
    const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: `${new URL(request.url).origin}/auth/callback?next=/` } });
    if (error) return errorResponse("We could not create that account.", 400, "signup_failed");
    const response = jsonResponse({ user: data.user ? { id: data.user.id, email: data.user.email } : null, verificationRequired: !data.session });
    return applySupabaseHeaders(response, responseHeaders);
  } catch { return errorResponse("Authentication is temporarily unavailable.", 503, "auth_unavailable"); }
}
