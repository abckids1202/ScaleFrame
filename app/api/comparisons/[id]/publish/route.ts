import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { comparisonRevisions, comparisons } from "../../../../../db/schema";
import { getCurrentUser } from "../../../../../lib/auth";
import { errorResponse, jsonResponse, sameOrigin, validCsrf } from "../../../../../lib/http";
import { writeAudit } from "../../../../../lib/security";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const user = await getCurrentUser(request);
  if (!user) return errorResponse("Sign in to publish a comparison.", 401, "authentication_required");
  if (!user.emailVerified) return errorResponse("Verify your email before publishing a comparison.", 403, "email_verification_required");
  const id = (await context.params).id;
  try {
    const db = getDb(); const comparison = (await db.select().from(comparisons).where(and(eq(comparisons.id, id), eq(comparisons.ownerAccountId, user.subject))).limit(1))[0];
    if (!comparison) return errorResponse("Comparison not found.", 404, "not_found");
    const revision = (await db.select().from(comparisonRevisions).where(and(eq(comparisonRevisions.comparisonId, id), eq(comparisonRevisions.revisionNumber, comparison.revisionNumber))).limit(1))[0];
    if (!revision) return errorResponse("Save a complete revision before publishing.", 409, "revision_required");
    const snapshot = JSON.parse(revision.snapshotJson) as { checklist?: Record<string, boolean>; calculation?: { totalA: number; totalB: number } };
    if (!snapshot.checklist || Object.values(snapshot.checklist).some((value) => value !== true) || !snapshot.calculation) return errorResponse("Complete every publish checklist item first.", 409, "publish_checklist_incomplete");
    const publishedAt = new Date().toISOString(); await db.update(comparisons).set({ status: "published", publishedAt, updatedAt: publishedAt }).where(eq(comparisons.id, id)); await db.update(comparisonRevisions).set({ publishedAt }).where(eq(comparisonRevisions.id, revision.id)); await writeAudit(user.subject, "comparison_published", "comparison", id, { revisionNumber: comparison.revisionNumber });
    return jsonResponse({ published: true, publishedAt, result: snapshot.calculation });
  } catch { return errorResponse("The comparison could not be published.", 503, "database_unavailable"); }
}
