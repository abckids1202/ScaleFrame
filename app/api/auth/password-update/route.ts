import { errorResponse, jsonResponse, sameOrigin, validCsrf } from "../../../../lib/http";
import { createRouteSupabaseClient, applySupabaseHeaders } from "../../../../lib/supabase";

export async function POST(request: Request) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const payload = await request.json().catch(() => null) as { password?: unknown } | null; const password = typeof payload?.password === "string" ? payload.password : ""; if (password.length < 10 || password.length > 128) return errorResponse("Password must be between 10 and 128 characters.");
  try { const { client, responseHeaders } = createRouteSupabaseClient(request); const { error } = await client.auth.updateUser({ password }); if (error) return errorResponse("Password update failed.", 400, "password_update_failed"); return applySupabaseHeaders(jsonResponse({ updated: true }), responseHeaders); } catch { return errorResponse("Authentication is temporarily unavailable.", 503, "auth_unavailable"); }
}
