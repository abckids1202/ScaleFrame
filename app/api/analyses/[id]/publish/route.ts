import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { analyses, analysisClaims, analysisRevisions, analysisSourceCards } from "../../../../../db/schema";
import { getCurrentUser } from "../../../../../lib/auth";
import { errorResponse, jsonResponse, sameOrigin, validCsrf } from "../../../../../lib/http";
import { writeAudit } from "../../../../../lib/security";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to publish research.", 401, "authentication_required");
  if (!user.emailVerified) return errorResponse("Verify your email before publishing research.", 403, "email_verification_required");
  const id = (await context.params).id;
  try {
    const db = getDb(); const analysis = (await db.select().from(analyses).where(and(eq(analyses.id, id), eq(analyses.ownerAccountId, user.subject))).limit(1))[0]; if (!analysis) return errorResponse("Analysis draft not found.", 404, "not_found");
    const revision = (await db.select().from(analysisRevisions).where(and(eq(analysisRevisions.analysisId, id), eq(analysisRevisions.revisionNumber, analysis.currentRevision))).limit(1))[0];
    const blocks = revision ? JSON.parse(revision.blocksJson) as Array<{ body?: string }> : []; const [sources, claims] = await Promise.all([db.select().from(analysisSourceCards).where(and(eq(analysisSourceCards.analysisId, id), eq(analysisSourceCards.revisionNumber, analysis.currentRevision))), db.select().from(analysisClaims).where(and(eq(analysisClaims.analysisId, id), eq(analysisClaims.revisionNumber, analysis.currentRevision)))]);
    if (!revision || !blocks.some((block) => Boolean(block.body?.trim())) || !sources.length || !claims.length || !analysis.title || !analysis.summary || !analysis.subjectLabel || !analysis.aspect) return errorResponse("Add a meaningful draft block, summary, source card, and structured claim before publishing.", 409, "publish_checklist_incomplete");
    const now = new Date().toISOString(); await db.update(analyses).set({ status: "published", publishedAt: now, updatedAt: now }).where(eq(analyses.id, id)); await writeAudit(user.subject, "analysis.published", "analysis", id, { revisionNumber: analysis.currentRevision }); return jsonResponse({ published: true, publishedAt: now, revisionNumber: analysis.currentRevision });
  } catch { return errorResponse("The analysis could not be published.", 503, "database_unavailable"); }
}
