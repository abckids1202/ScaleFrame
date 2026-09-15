import { errorResponse, jsonResponse, sameOrigin, validCsrf } from "../../../../lib/http";
import { applySupabaseHeaders, createRouteSupabaseClient } from "../../../../lib/supabase";

export async function POST(request: Request) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  try { const { client, responseHeaders } = createRouteSupabaseClient(request); await client.auth.signOut({ scope: "global" }); return applySupabaseHeaders(jsonResponse({ authenticated: false }), responseHeaders); }
  catch { return errorResponse("Sign-out is temporarily unavailable.", 503, "auth_unavailable"); }
}
