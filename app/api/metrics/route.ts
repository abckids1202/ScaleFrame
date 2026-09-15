import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { metricVersions } from "../../../db/schema";
import { seedMetrics } from "../../../db/seed-data";
import { jsonResponse } from "../../../lib/http";

export async function GET(request: Request) {
  const domain = new URL(request.url).searchParams.get("domain");
  try {
    const db = getDb();
    const rows = await db.select().from(metricVersions).where(domain ? eq(metricVersions.domain, domain) : undefined).orderBy(asc(metricVersions.domain), asc(metricVersions.name)).limit(250);
    return jsonResponse({ source: "d1", metrics: rows });
  } catch {
    const metrics = domain ? seedMetrics.filter((metric) => metric.domain === domain) : seedMetrics;
    return jsonResponse({ source: "seed-fallback", metrics });
  }
}
