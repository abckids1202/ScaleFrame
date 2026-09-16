import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { analyses, analysisComments, profiles } from "../../../../../db/schema";
import { getCurrentUser } from "../../../../../lib/auth";
import { errorResponse, jsonResponse, safeText, sameOrigin, validCsrf } from "../../../../../lib/http";
import { newId } from "../../../../../lib/ids";
import { enforceRateLimit, writeAudit } from "../../../../../lib/security";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const id = (await context.params).id;
  try {
    const rows = await getDb().select({ id: analysisComments.id, body: analysisComments.body, revisionNumber: analysisComments.revisionNumber, createdAt: analysisComments.createdAt, author: profiles.displayName, handle: profiles.handle }).from(analysisComments).leftJoin(profiles, eq(profiles.accountId, analysisComments.authorAccountId)).where(and(eq(analysisComments.analysisId, id), eq(analysisComments.status, "visible"))).orderBy(asc(analysisComments.createdAt)).limit(100);
    return jsonResponse({ comments: rows });
  } catch { return errorResponse("Comments are temporarily unavailable.", 503, "database_unavailable"); }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to join the discussion.", 401, "authentication_required"); if (!user.emailVerified) return errorResponse("Verify your email before commenting.", 403, "email_verification_required");
  const id = (await context.params).id; const payload = await request.json().catch(() => null) as { body?: unknown; revisionNumber?: unknown } | null; const body = safeText(payload?.body, 2000); const revisionNumber = Number(payload?.revisionNumber ?? 1);
  if (body.length < 2 || !Number.isInteger(revisionNumber) || revisionNumber < 1) return errorResponse("Write a short, readable comment.", 400, "validation_failed");
  try {
    const limit = await enforceRateLimit(`analysis_comment:${user.subject}`, 30, 3600); if (!limit.allowed) return errorResponse("Too many comments. Try again later.", 429, "rate_limited");
    const analysis = (await getDb().select().from(analyses).where(and(eq(analyses.id, id), eq(analyses.status, "published"))).limit(1))[0]; if (!analysis) return errorResponse("Analysis not found.", 404, "not_found");
    const comment = { id: newId("analysiscomment"), analysisId: id, revisionNumber, authorAccountId: user.subject, body, status: "visible" } as const; await getDb().insert(analysisComments).values(comment); await writeAudit(user.subject, "analysis.comment_created", "analysis", id); return jsonResponse({ comment: { ...comment, author: "You" } }, { status: 201 });
  } catch { return errorResponse("Your comment could not be saved.", 503, "database_unavailable"); }
}
