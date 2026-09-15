import { getDb } from "../../../db";
import { moderationCases } from "../../../db/schema";
import { getCurrentUser } from "../../../lib/auth";
import { newId } from "../../../lib/ids";
import { errorResponse, jsonResponse, safeText, sameOrigin } from "../../../lib/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Cross-origin write rejected.", 403, "origin_rejected");
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to submit a report.", 401, "authentication_required");
  const payload = await request.json().catch(() => null) as { targetType?: unknown; targetId?: unknown; category?: unknown; description?: unknown } | null;
  const targetType = safeText(payload?.targetType, 40); const targetId = safeText(payload?.targetId, 160); const category = safeText(payload?.category, 60); const description = safeText(payload?.description, 4000);
  if (!targetType || !targetId || !category || !description) return errorResponse("Report target, category, and description are required.");
  try { const id = newId("report"); await getDb().insert(moderationCases).values({ id, reporterAccountId: user.subject, targetType, targetId, category, description, status: "open" }); return jsonResponse({ id, status: "open" }, { status: 201 }); }
  catch { return errorResponse("Reports are temporarily unavailable.", 503, "storage_unavailable"); }
}
