import { and, eq, or } from "drizzle-orm";
import { comparisonCollaborationRequests, comparisons, profiles } from "../../../../../db/schema";
import { getDb } from "../../../../../db";
import { getCurrentUser } from "../../../../../lib/auth";
import { errorResponse, jsonResponse, safeText, sameOrigin, validCsrf } from "../../../../../lib/http";
import { newId } from "../../../../../lib/ids";
import { enforceRateLimit, writeAudit } from "../../../../../lib/security";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(request);
  if (!user) return errorResponse("Sign in to view collaboration requests.", 401, "authentication_required");
  const comparisonId = (await context.params).id;
  try {
    const db = getDb();
    const comparison = (await db.select({ id: comparisons.id, ownerAccountId: comparisons.ownerAccountId }).from(comparisons).where(eq(comparisons.id, comparisonId)).limit(1))[0];
    if (!comparison) return errorResponse("Comparison not found.", 404, "not_found");
    const isOwner = comparison.ownerAccountId === user.subject;
    const requests = await db.select({
      id: comparisonCollaborationRequests.id,
      comparisonId: comparisonCollaborationRequests.comparisonId,
      requesterAccountId: comparisonCollaborationRequests.requesterAccountId,
      targetAccountId: comparisonCollaborationRequests.targetAccountId,
      targetHandle: comparisonCollaborationRequests.targetHandle,
      message: comparisonCollaborationRequests.message,
      status: comparisonCollaborationRequests.status,
      responseNote: comparisonCollaborationRequests.responseNote,
      createdAt: comparisonCollaborationRequests.createdAt,
      resolvedAt: comparisonCollaborationRequests.resolvedAt,
      requesterHandle: profiles.handle,
    }).from(comparisonCollaborationRequests)
      .leftJoin(profiles, eq(profiles.accountId, comparisonCollaborationRequests.requesterAccountId))
      .where(isOwner
        ? eq(comparisonCollaborationRequests.comparisonId, comparisonId)
        : and(eq(comparisonCollaborationRequests.comparisonId, comparisonId), or(eq(comparisonCollaborationRequests.targetAccountId, user.subject), eq(comparisonCollaborationRequests.requesterAccountId, user.subject))))
      .limit(100);
    if (!isOwner && !requests.length) return errorResponse("You do not have access to these requests.", 403, "forbidden");
    return jsonResponse({ requests });
  } catch {
    return errorResponse("Collaboration requests are temporarily unavailable.", 503, "database_unavailable");
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const user = await getCurrentUser(request);
  if (!user) return errorResponse("Sign in before inviting a collaborator.", 401, "authentication_required");
  const comparisonId = (await context.params).id;
  const payload = await request.json().catch(() => null) as { targetHandle?: unknown; message?: unknown } | null;
  const targetHandle = safeText(payload?.targetHandle, 64).replace(/^@/, "").toLowerCase();
  const message = safeText(payload?.message, 2000);
  if (!/^[a-z0-9_][a-z0-9_-]{1,63}$/.test(targetHandle)) return errorResponse("Enter a valid researcher handle.", 400, "validation_failed");
  try {
    const limit = await enforceRateLimit(`comparison_collaboration:${user.subject}`, 20, 3600);
    if (!limit.allowed) return errorResponse("Too many collaboration requests. Try again later.", 429, "rate_limited");
    const db = getDb();
    const comparison = (await db.select().from(comparisons).where(and(eq(comparisons.id, comparisonId), eq(comparisons.ownerAccountId, user.subject))).limit(1))[0];
    if (!comparison) return errorResponse("Comparison draft not found.", 404, "not_found");
    const target = (await db.select({ accountId: profiles.accountId, handle: profiles.handle }).from(profiles).where(eq(profiles.handle, targetHandle)).limit(1))[0];
    if (target?.accountId === user.subject) return errorResponse("You cannot invite yourself.", 400, "validation_failed");
    const createdAt = new Date().toISOString();
    const [created] = await db.insert(comparisonCollaborationRequests).values({ id: newId("cmpcollab"), comparisonId, requesterAccountId: user.subject, targetAccountId: target?.accountId ?? null, targetHandle, message, status: "pending", createdAt, updatedAt: createdAt }).returning();
    await writeAudit(user.subject, "comparison.collaboration_requested", "comparison", comparisonId, { targetHandle, resolvedTarget: Boolean(target) });
    return jsonResponse({ request: created }, { status: 201 });
  } catch {
    return errorResponse("The collaboration request could not be saved.", 503, "database_unavailable");
  }
}
