import { getCurrentUser } from "../../../lib/auth";
import { errorResponse, jsonResponse, safeText, sameOrigin } from "../../../lib/http";
import { getDb } from "../../../db";
import { metricProposals } from "../../../db/schema";
import { newId } from "../../../lib/ids";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Cross-origin write rejected.", 403, "origin_rejected");
  const user = await getCurrentUser(request);
  if (!user) return errorResponse("Sign in to propose a metric.", 401, "authentication_required");
  const payload = await request.json().catch(() => null) as { name?: unknown; domain?: unknown; definition?: unknown } | null;
  const name = safeText(payload?.name, 100);
  const definition = safeText(payload?.definition, 2000);
  const domain = safeText(payload?.domain, 8).toUpperCase();
  if (!name || !definition || !["WIS", "SCD", "WW", "CUSTOM"].includes(domain)) return errorResponse("Name, definition, and supported domain are required.");
  try {
    const id = newId("mprop");
    await getDb().insert(metricProposals).values({ id, proposerAccountId: user.subject, name, definition, domain });
    return jsonResponse({ proposal: { id, status: "pending_duplicate_review", name, definition, domain, submittedBy: user.subject }, message: "Proposal accepted for duplicate review and community review." }, { status: 202 });
  } catch {
    return errorResponse("Metric proposals are temporarily unavailable.", 503, "storage_unavailable");
  }
}
