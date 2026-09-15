import { seedCharacters, seedComparisons, seedMetrics, seedWorks } from "../../../db/seed-data";
import { jsonResponse } from "../../../lib/http";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  const matches = <T extends { title?: string; name?: string; slug: string }>(items: T[]) => query ? items.filter((item) => `${item.title ?? item.name ?? ""} ${item.slug}`.toLowerCase().includes(query)) : items;
  return jsonResponse({ query, works: matches(seedWorks), characters: matches(seedCharacters), metrics: matches(seedMetrics), comparisons: matches(seedComparisons) });
}
