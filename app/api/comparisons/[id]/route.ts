import { and, eq, or } from "drizzle-orm";
import { getDb } from "../../../../db";
import { comparisonRevisions, comparisons } from "../../../../db/schema";
import { getCurrentUser } from "../../../../lib/auth";
import { errorResponse, jsonResponse } from "../../../../lib/http";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = (await context.params).id; const user = await getCurrentUser(request);
  try { const db = getDb(); const rows = await db.select().from(comparisons).where(or(eq(comparisons.id, id), eq(comparisons.slug, id))).limit(1); const comparison = rows[0]; if (!comparison) return errorResponse("Comparison not found.", 404, "not_found"); if (comparison.status !== "published" && comparison.ownerAccountId !== user?.subject) return errorResponse("Comparison not found.", 404, "not_found"); const revisions = await db.select().from(comparisonRevisions).where(and(eq(comparisonRevisions.comparisonId, comparison.id), eq(comparisonRevisions.revisionNumber, comparison.revisionNumber))).limit(1); return jsonResponse({ comparison, revision: revisions[0] ?? null }); } catch { return errorResponse("Comparison data is temporarily unavailable.", 503, "database_unavailable"); }
}
