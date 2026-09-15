import { errorResponse, sameOrigin } from "../../../../lib/http";
import { applySupabaseHeaders, createRouteSupabaseClient } from "../../../../lib/supabase";

export async function GET(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Cross-origin request rejected.", 403, "origin_rejected");
  try { const next = new URL(request.url).searchParams.get("next"); const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/"; const { client, responseHeaders } = createRouteSupabaseClient(request); const { data, error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${new URL(request.url).origin}/api/auth/callback?next=${encodeURIComponent(safeNext)}` } }); if (error || !data.url) return errorResponse("Google sign-in is not configured yet.", 503, "oauth_unavailable"); const response = new Response(null, { status: 302, headers: { location: data.url } }); return applySupabaseHeaders(response, responseHeaders); }
  catch { return errorResponse("Authentication is temporarily unavailable.", 503, "auth_unavailable"); }
}
