import { errorResponse, jsonResponse } from "../../../../lib/http";
import { getCurrentUser } from "../../../../lib/auth";
import { createRouteSupabaseClient } from "../../../../lib/supabase";

export async function GET(request: Request) {
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to manage sessions.", 401, "authentication_required");
  try { const { client } = createRouteSupabaseClient(request); const { data } = await client.auth.getSession(); return jsonResponse({ current: data.session ? { userId: user.subject, expiresAt: data.session.expires_at ?? null } : null, globalSignOut: "/api/auth/sign-out" }); } catch { return errorResponse("Session management is temporarily unavailable.", 503, "auth_unavailable"); }
}
