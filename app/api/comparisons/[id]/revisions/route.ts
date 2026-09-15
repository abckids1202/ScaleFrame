import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { comparisonRevisions, comparisons } from "../../../../../db/schema";
import { getCurrentUser } from "../../../../../lib/auth";
import { errorResponse, jsonResponse, sameOrigin, validCsrf } from "../../../../../lib/http";
import { enforceRateLimit } from "../../../../../lib/security";
import { comparisonRevisionSchema } from "../../../../../lib/validation";
import { calculateComparison } from "../../../../../lib/scoring";
import { newId } from "../../../../../lib/ids";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to save a comparison.", 401, "authentication_required"); const id = (await context.params).id;
  const payload = await request.json().catch(() => null); const parsed = comparisonRevisionSchema.safeParse(payload); if (!parsed.success) return errorResponse("Comparison revision is incomplete or invalid.", 400, "validation_failed");
  if (new Set(parsed.data.participants.map((participant) => participant.side)).size !== 2) return errorResponse("A comparison needs one participant on each side.", 400, "validation_failed");
  try { const limit = await enforceRateLimit(`comparison_revision:${user.subject}`, 60, 3600); if (!limit.allowed) return errorResponse("Too many saves. Try again later.", 429, "rate_limited"); const db = getDb(); const comparison = (await db.select().from(comparisons).where(and(eq(comparisons.id, id), eq(comparisons.ownerAccountId, user.subject))).limit(1))[0]; if (!comparison) return errorResponse("Comparison not found.", 404, "not_found"); const result = calculateComparison(parsed.data.metrics.map((metric) => ({ participantA: metric.scoreA, participantB: metric.scoreB, weight: metric.weight, confidence: metric.confidence }))); const revisionNumber = comparison.revisionNumber + 1; const snapshot = { ...parsed.data, calculation: result, savedAt: new Date().toISOString() }; await db.insert(comparisonRevisions).values({ id: newId("cmprev"), comparisonId: comparison.id, revisionNumber, createdByAccountId: user.subject, snapshotJson: JSON.stringify(snapshot), changeNote: "Editor save" }); await db.update(comparisons).set({ revisionNumber, updatedAt: new Date().toISOString() }).where(eq(comparisons.id, comparison.id)); return jsonResponse({ revisionNumber, calculation: result }, { status: 201 }); } catch { return errorResponse("The comparison could not be saved.", 503, "database_unavailable"); }
}
