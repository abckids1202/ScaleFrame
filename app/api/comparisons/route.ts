import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { comparisons } from "../../../db/schema";
import { seedComparisons } from "../../../db/seed-data";
import { getCurrentUser } from "../../../lib/auth";
import { errorResponse, jsonResponse, sameOrigin } from "../../../lib/http";
import { newId, slugify } from "../../../lib/ids";
import { comparisonCreateSchema } from "../../../lib/validation";
import { enforceRateLimit, writeAudit } from "../../../lib/security";
import { syncAccount } from "../../../lib/accounts";
import { validCsrf } from "../../../lib/http";

export async function GET() {
  try { return jsonResponse({ source: "d1", comparisons: await getDb().select().from(comparisons).where(eq(comparisons.status, "published")).limit(100) }); } catch { return jsonResponse({ source: "seed-fallback", comparisons: seedComparisons }); }
}

export async function POST(request: Request) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const user = await getCurrentUser(request);
  if (!user) return errorResponse("Sign in to create a comparison.", 401, "authentication_required");
  const parsed = comparisonCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("A title and supported comparison settings are required.", 400, "validation_failed");
  try {
    const limit = await enforceRateLimit(`comparison_create:${user.subject}`, 30, 3600); if (!limit.allowed) return errorResponse("Too many comparison drafts. Try again later.", 429, "rate_limited");
    await syncAccount({ id: user.subject, email: user.email });
    const { title, domain, formatMode, spoilerLevel, contentRating } = parsed.data;
    const record = { id: newId("cmp"), slug: `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}`, ownerAccountId: user.subject, title, domain, status: "draft", formatMode, spoilerLevel, contentRating, difficulty: "high_diff", overallMethod: "normalized_weighted_score", rulesJson: "{}", revisionNumber: 0 } as const;
    const [created] = await getDb().insert(comparisons).values(record).returning();
    await writeAudit(user.subject, "comparison_created", "comparison", created.id, { domain });
    return jsonResponse({ comparison: created }, { status: 201 });
  } catch { return errorResponse("The comparison could not be saved. Check the database migration state.", 503, "database_unavailable"); }
}
