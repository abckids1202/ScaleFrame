import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { comparisonRevisions, comparisons } from "../../../../../db/schema";
import { getCurrentUser } from "../../../../../lib/auth";
import { errorResponse, jsonResponse, sameOrigin, validCsrf } from "../../../../../lib/http";
import { enforceRateLimit } from "../../../../../lib/security";
import { comparisonRevisionSchema } from "../../../../../lib/validation";
import { calculateMatchup } from "../../../../../lib/scoring";
import { newId } from "../../../../../lib/ids";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to save a comparison.", 401, "authentication_required"); const id = (await context.params).id;
  const parsed = comparisonRevisionSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return errorResponse("Comparison revision is incomplete or invalid.", 400, "validation_failed");
  if (!parsed.data.participants.some((participant) => participant.side === "A") || !parsed.data.participants.some((participant) => participant.side === "B")) return errorResponse("Add at least one participant to each side.", 400, "validation_failed");
  const participantIds = new Set(parsed.data.participants.map((participant) => participant.participantId)); if (participantIds.size !== parsed.data.participants.length || parsed.data.metrics.some((metric) => metric.scores.some((score) => !participantIds.has(score.participantId)))) return errorResponse("Every participant needs a unique identity and a score in each metric.", 400, "validation_failed");
  try {
    const limit = await enforceRateLimit(`comparison_revision:${user.subject}`, 60, 3600); if (!limit.allowed) return errorResponse("Too many saves. Try again later.", 429, "rate_limited"); const db = getDb(); const comparison = (await db.select().from(comparisons).where(and(eq(comparisons.id, id), eq(comparisons.ownerAccountId, user.subject))).limit(1))[0]; if (!comparison) return errorResponse("Comparison not found.", 404, "not_found");
    const result = calculateMatchup(parsed.data.participants.map((participant) => ({ participantId: participant.participantId, side: participant.side, label: participant.label })), parsed.data.metrics, parsed.data.scoreMode); const revisionNumber = comparison.revisionNumber + 1; const now = new Date().toISOString(); const snapshot = { ...parsed.data, calculation: result, savedAt: now };
    await db.insert(comparisonRevisions).values({ id: newId("cmprev"), comparisonId: comparison.id, revisionNumber, createdByAccountId: user.subject, snapshotJson: JSON.stringify(snapshot), changeNote: "Comparison Studio save", createdAt: now }); await db.update(comparisons).set({ revisionNumber, matchupType: parsed.data.matchupType, participantCountA: parsed.data.participants.filter((participant) => participant.side === "A").length, participantCountB: parsed.data.participants.filter((participant) => participant.side === "B").length, scoreMode: parsed.data.scoreMode, difficulty: parsed.data.difficulty, updatedAt: now }).where(eq(comparisons.id, comparison.id)); return jsonResponse({ revisionNumber, calculation: result }, { status: 201 });
  } catch { return errorResponse("The comparison could not be saved.", 503, "database_unavailable"); }
}
