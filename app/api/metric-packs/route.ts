import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { metricPackItems, metricPacks, metricVersions } from "../../../db/schema";
import { seedMetrics } from "../../../db/seed-data";
import { jsonResponse } from "../../../lib/http";

export async function GET(request: Request) {
  const domain = new URL(request.url).searchParams.get("domain");
  try { const db = getDb(); const packs = await db.select().from(metricPacks).where(domain ? eq(metricPacks.domain, domain.toUpperCase()) : undefined).orderBy(asc(metricPacks.domain), asc(metricPacks.name)); const result = await Promise.all(packs.map(async (pack) => ({ ...pack, items: await db.select().from(metricPackItems).leftJoin(metricVersions, eq(metricPackItems.metricVersionId, metricVersions.id)).where(eq(metricPackItems.packId, pack.id)).orderBy(asc(metricPackItems.displayOrder)) }))); return jsonResponse({ source: "d1", packs: result }); } catch { const domains = domain ? [domain.toUpperCase()] : ["WIS", "SCD", "WW"]; return jsonResponse({ source: "seed-fallback", packs: domains.map((item) => ({ id: `seed-pack-${item.toLowerCase()}`, slug: `${item.toLowerCase()}-core`, name: `${item} Core`, domain: item, status: "curated", items: seedMetrics.filter((metric) => metric.domain === item) })) }); }
}
