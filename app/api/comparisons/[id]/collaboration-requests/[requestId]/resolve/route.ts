import { and, eq } from "drizzle-orm";
import { comparisonCollaborationRequests, comparisons } from "../../../../../../../db/schema";
import { getDb } from "../../../../../../../db";
import { getCurrentUser } from "../../../../../../../lib/auth";
import { errorResponse, jsonResponse, safeText, sameOrigin, validCsrf } from "../../../../../../../lib/http";
import { enforceRateLimit, writeAudit } from "../../../../../../../lib/security";

export async function POST(request: Request, context: { params: Promise<{ id: string; requestId: string }> }) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const user = await getCurrentUser(request);
  if (!user) return errorResponse("Sign in to manage collaboration requests.", 401, "authentication_required");
  const { id: comparisonId, requestId } = await context.params;
  const payload = await request.json().catch(() => null) as { status?: unknown; responseNote?: unknown } | null;
  const status = payload?.status;
  const responseNote = safeText(payload?.responseNote, 2000);
  if (status !== "accepted" && status !== "rejected" && status !== "withdrawn") return errorResponse("Choose accepted, rejected, or withdrawn.", 400, "validation_failed");
  try {
    const limit = await enforceRateLimit(`comparison_collaboration_resolve:${user.subject}`, 40, 3600);
    if (!limit.allowed) return errorResponse("Too many request updates. Try again later.", 429, "rate_limited");
    const db = getDb();
    const row = (await db.select({ request: comparisonCollaborationRequests, comparisonOwnerId: comparisons.ownerAccountId }).from(comparisonCollaborationRequests).innerJoin(comparisons, eq(comparisons.id, comparisonCollaborationRequests.comparisonId)).where(and(eq(comparisonCollaborationRequests.id, requestId), eq(comparisonCollaborationRequests.comparisonId, comparisonId))).limit(1))[0];
    if (!row) return errorResponse("Collaboration request not found.", 404, "not_found");
    const canRespond = row.request.targetAccountId === user.subject && (status === "accepted" || status === "rejected");
    const canWithdraw = row.request.requesterAccountId === user.subject && status === "withdrawn";
    if (!canRespond && !canWithdraw) return errorResponse("You cannot update this request.", 403, "forbidden");
    if (row.request.status !== "pending") return errorResponse("This request has already been resolved.", 409, "already_resolved");
    const now = new Date().toISOString();
    const [updated] = await db.update(comparisonCollaborationRequests).set({ status, responseNote, resolvedAt: now, updatedAt: now }).where(eq(comparisonCollaborationRequests.id, requestId)).returning();
    await writeAudit(user.subject, `comparison.collaboration_${status}`, "comparison_collaboration_request", requestId, { comparisonId });
    return jsonResponse({ request: updated });
  } catch {
    return errorResponse("The collaboration request could not be updated.", 503, "database_unavailable");
  }
}
