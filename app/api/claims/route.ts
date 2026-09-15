import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { claims, comparisons } from "../../../db/schema";
import { getCurrentUser } from "../../../lib/auth";
import { errorResponse, jsonResponse, sameOrigin, validCsrf } from "../../../lib/http";
import { newId } from "../../../lib/ids";
import { enforceRateLimit } from "../../../lib/security";
import { claimSchema } from "../../../lib/validation";

export async function POST(request: Request) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected"); const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to add evidence.", 401, "authentication_required"); const parsed = claimSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return errorResponse("Claim and source details are incomplete.", 400, "validation_failed");
  try { const limit = await enforceRateLimit(`claim_create:${user.subject}`, 120, 3600); if (!limit.allowed) return errorResponse("Too many evidence entries. Try again later.", 429, "rate_limited"); const db = getDb(); if (parsed.data.comparisonId) { const comparison = (await db.select().from(comparisons).where(eq(comparisons.id, parsed.data.comparisonId)).limit(1))[0]; if (!comparison || comparison.ownerAccountId !== user.subject) return errorResponse("Comparison not found.", 404, "not_found"); } const id = newId("claim"); await db.insert(claims).values({ id, ownerAccountId: user.subject, comparisonId: parsed.data.comparisonId ?? null, comparisonCategoryId: parsed.data.comparisonCategoryId ?? null, ...parsed.data }); return jsonResponse({ claim: { id, ...parsed.data } }, { status: 201 }); } catch { return errorResponse("Evidence storage is temporarily unavailable.", 503, "database_unavailable"); }
}
