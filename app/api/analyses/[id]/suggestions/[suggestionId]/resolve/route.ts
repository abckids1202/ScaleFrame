import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../../../db";
import { analyses, analysisSuggestions } from "../../../../../../../db/schema";
import { getCurrentUser } from "../../../../../../../lib/auth";
import { errorResponse, jsonResponse, safeText, sameOrigin, validCsrf } from "../../../../../../../lib/http";
import { writeAudit } from "../../../../../../../lib/security";

export async function POST(request: Request, context: { params: Promise<{ id: string; suggestionId: string }> }) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to resolve suggestions.", 401, "authentication_required"); if (!user.emailVerified) return errorResponse("Verify your email before resolving suggestions.", 403, "email_verification_required"); const params = await context.params;
  const payload = await request.json().catch(() => null) as { status?: unknown; resolutionNote?: unknown } | null; const status = payload?.status === "accepted" || payload?.status === "rejected" ? payload.status : ""; const resolutionNote = safeText(payload?.resolutionNote, 1000); if (!status) return errorResponse("Choose accepted or rejected.", 400, "validation_failed");
  try { const db = getDb(); const analysis = (await db.select().from(analyses).where(and(eq(analyses.id, params.id), eq(analyses.ownerAccountId, user.subject))).limit(1))[0]; if (!analysis) return errorResponse("Analysis not found.", 404, "not_found"); const suggestion = (await db.select().from(analysisSuggestions).where(and(eq(analysisSuggestions.id, params.suggestionId), eq(analysisSuggestions.analysisId, params.id))).limit(1))[0]; if (!suggestion) return errorResponse("Suggestion not found.", 404, "not_found"); const now = new Date().toISOString(); await db.update(analysisSuggestions).set({ status, resolutionNote, resolvedByAccountId: user.subject, resolvedAt: now, updatedAt: now }).where(eq(analysisSuggestions.id, suggestion.id)); await writeAudit(user.subject, "analysis.suggestion_resolved", "suggestion", suggestion.id, { status }); return jsonResponse({ resolved: true, status, resolutionNote }); } catch { return errorResponse("The suggestion could not be resolved.", 503, "database_unavailable"); }
}
