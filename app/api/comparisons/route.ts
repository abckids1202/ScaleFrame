import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { comparisons } from "../../../db/schema";
import { seedComparisons } from "../../../db/seed-data";
import { getCurrentUser } from "../../../lib/auth";
import { errorResponse, jsonResponse, safeText, sameOrigin } from "../../../lib/http";
import { newId, slugify } from "../../../lib/ids";

export async function GET() {
  try { return jsonResponse({ source: "d1", comparisons: await getDb().select().from(comparisons).where(eq(comparisons.status, "published")).limit(100) }); } catch { return jsonResponse({ source: "seed-fallback", comparisons: seedComparisons }); }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Cross-origin write rejected.", 403, "origin_rejected");
  const user = await getCurrentUser(request);
  if (!user) return errorResponse("Sign in to create a comparison.", 401, "authentication_required");
  const payload = await request.json().catch(() => null) as { title?: unknown; domain?: unknown; formatMode?: unknown } | null;
  const title = safeText(payload?.title, 160);
  const domain = safeText(payload?.domain, 8).toUpperCase();
  if (!title || !["WIS", "SCD", "WW", "CUSTOM"].includes(domain)) return errorResponse("A title and supported domain are required.");
  try {
    const record = { id: newId("cmp"), slug: `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}`, ownerAccountId: user.subject, title, domain, status: "draft", formatMode: safeText(payload?.formatMode, 24) || "decisive", spoilerLevel: 0, contentRating: "general", difficulty: "high_diff", overallMethod: "normalized_weighted_score", rulesJson: "{}", revisionNumber: 1 } as const;
    const [created] = await getDb().insert(comparisons).values(record).returning();
    return jsonResponse({ comparison: created }, { status: 201 });
  } catch { return errorResponse("The comparison could not be saved. Check the database migration state.", 503, "database_unavailable"); }
}
