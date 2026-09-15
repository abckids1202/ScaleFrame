import { syncAccount } from "../../../../lib/accounts";
import { createRouteSupabaseClient } from "../../../../lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url); const code = url.searchParams.get("code"); const next = url.searchParams.get("next"); const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  if (!code) return Response.redirect(new URL(`/auth/sign-in?error=missing_code`, url.origin), 303);
  try { const { client, responseHeaders } = createRouteSupabaseClient(request); const { data, error } = await client.auth.exchangeCodeForSession(code); if (error || !data.user) return Response.redirect(new URL(`/auth/sign-in?error=oauth_failed`, url.origin), 303); await syncAccount({ id: data.user.id, email: data.user.email, email_confirmed_at: data.user.email_confirmed_at }); const response = Response.redirect(new URL(safeNext, url.origin), 303); responseHeaders.forEach((value, key) => response.headers.append(key, value)); return response; }
  catch { return Response.redirect(new URL(`/auth/sign-in?error=auth_unavailable`, url.origin), 303); }
}
