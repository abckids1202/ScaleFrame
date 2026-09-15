import { getDb } from "../../../db";
import { evidence } from "../../../db/schema";
import { getCurrentUser } from "../../../lib/auth";
import { errorResponse, jsonResponse, safeText, sameOrigin, validCsrf } from "../../../lib/http";
import { newId } from "../../../lib/ids";

export async function POST(request: Request) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected"); const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to add evidence.", 401, "authentication_required"); const payload = await request.json().catch(() => null) as { sourceReference?: unknown; sourceType?: unknown; claim?: unknown; contextNote?: unknown; reliability?: unknown; spoilerLevel?: unknown } | null; const sourceReference = safeText(payload?.sourceReference, 500); const claim = safeText(payload?.claim, 4000); if (!sourceReference || !claim) return errorResponse("Source reference and claim are required.");
  try { const id = newId("evidence"); await getDb().insert(evidence).values({ id, ownerAccountId: user.subject, sourceReference, sourceType: safeText(payload?.sourceType, 80) || "reference", claim, contextNote: safeText(payload?.contextNote, 4000), reliability: safeText(payload?.reliability, 40) || "unrated", provenanceJson: JSON.stringify({ submittedBy: user.subject }), spoilerLevel: Number(payload?.spoilerLevel) || 0 }); return jsonResponse({ evidence: { id, sourceReference, claim } }, { status: 201 }); } catch { return errorResponse("Evidence storage is temporarily unavailable.", 503, "database_unavailable"); }
}
