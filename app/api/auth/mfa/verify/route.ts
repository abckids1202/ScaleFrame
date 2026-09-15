import { errorResponse, jsonResponse, safeText, sameOrigin, validCsrf } from "../../../../../lib/http";
import { getCurrentUser } from "../../../../../lib/auth";
import { createRouteSupabaseClient, applySupabaseHeaders } from "../../../../../lib/supabase";

export async function POST(request: Request) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  if (!await getCurrentUser(request)) return errorResponse("Sign in to verify MFA.", 401, "authentication_required");
  const payload = await request.json().catch(() => null) as { factorId?: unknown; code?: unknown } | null; const factorId = safeText(payload?.factorId, 100); const code = safeText(payload?.code, 12); if (!factorId || !/^\d{6}$/.test(code)) return errorResponse("A factor ID and six-digit code are required.");
  try { const { client, responseHeaders } = createRouteSupabaseClient(request); const challenge = await client.auth.mfa.challenge({ factorId }); if (challenge.error) return errorResponse("MFA challenge failed.", 400, "mfa_challenge_failed"); const verified = await client.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code }); if (verified.error) return errorResponse("MFA code is incorrect.", 400, "mfa_verify_failed"); return applySupabaseHeaders(jsonResponse({ verified: true }), responseHeaders); } catch { return errorResponse("MFA verification is unavailable.", 503, "mfa_unavailable"); }
}
