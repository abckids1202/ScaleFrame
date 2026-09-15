import { errorResponse, jsonResponse, sameOrigin, validCsrf } from "../../../../../lib/http";
import { getCurrentUser } from "../../../../../lib/auth";
import { createRouteSupabaseClient, applySupabaseHeaders } from "../../../../../lib/supabase";

export async function POST(request: Request) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  if (!await getCurrentUser(request)) return errorResponse("Sign in to enroll MFA.", 401, "authentication_required");
  try { const { client, responseHeaders } = createRouteSupabaseClient(request); const { data, error } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "ScaleFrame authenticator" }); if (error || !data) return errorResponse("MFA enrollment is unavailable.", 503, "mfa_unavailable"); return applySupabaseHeaders(jsonResponse({ factorId: data.id, type: data.type, totp: data.totp }), responseHeaders); } catch { return errorResponse("MFA enrollment is unavailable.", 503, "mfa_unavailable"); }
}
