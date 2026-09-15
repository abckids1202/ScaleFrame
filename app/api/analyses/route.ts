import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { analyses } from "../../../db/schema";
import { getCurrentUser } from "../../../lib/auth";
import { newId, slugify } from "../../../lib/ids";
import { errorResponse, jsonResponse, safeText, sameOrigin } from "../../../lib/http";

export async function GET() {
  try { return jsonResponse({ source: "d1", analyses: await getDb().select().from(analyses).where(eq(analyses.status, "published")).orderBy(desc(analyses.publishedAt)).limit(50) }); }
  catch { return jsonResponse({ source: "seed-fallback", analyses: [{ slug: "strategist-ceiling", title: "The strategist's ceiling", domain: "SCD", status: "published" }] }); }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Cross-origin write rejected.", 403, "origin_rejected");
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to create an analysis.", 401, "authentication_required");
  const payload = await request.json().catch(() => null) as { title?: unknown; domain?: unknown } | null;
  const title = safeText(payload?.title, 160); const domain = safeText(payload?.domain, 8).toUpperCase();
  if (!title || !["WIS", "SCD", "WW"].includes(domain)) return errorResponse("Title and supported domain are required.");
  try { const id = newId("analysis"); await getDb().insert(analyses).values({ id, slug: slugify(title), ownerAccountId: user.subject, title, domain, status: "draft" }); return jsonResponse({ id, status: "draft" }, { status: 201 }); }
  catch { return errorResponse("Analysis storage is temporarily unavailable.", 503, "storage_unavailable"); }
}
