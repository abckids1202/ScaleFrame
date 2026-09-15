import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { studioProjects } from "../../../../db/schema";
import { getCurrentUser } from "../../../../lib/auth";
import { newId } from "../../../../lib/ids";
import { errorResponse, jsonResponse, safeText, sameOrigin } from "../../../../lib/http";

export async function GET(request: Request) {
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to view Studio projects.", 401, "authentication_required");
  try { return jsonResponse({ projects: await getDb().select().from(studioProjects).where(eq(studioProjects.ownerAccountId, user.subject)).orderBy(desc(studioProjects.updatedAt)).limit(50) }); }
  catch { return errorResponse("Studio storage is temporarily unavailable.", 503, "storage_unavailable"); }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse("Cross-origin write rejected.", 403, "origin_rejected");
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to create a Studio project.", 401, "authentication_required");
  const payload = await request.json().catch(() => null) as { name?: unknown; preset?: unknown; comparisonId?: unknown } | null;
  const name = safeText(payload?.name, 120) || "Untitled comparison card"; const preset = safeText(payload?.preset, 8) || "9:16";
  if (!["9:16", "1:1", "16:9"].includes(preset)) return errorResponse("Unsupported Studio preset.");
  try { const id = newId("studio"); await getDb().insert(studioProjects).values({ id, ownerAccountId: user.subject, name, preset, comparisonId: safeText(payload?.comparisonId, 100) || null, projectJson: JSON.stringify({ version: 1, layers: [], keyframes: [], autosave: true }) }); return jsonResponse({ id, status: "draft", preset }, { status: 201 }); }
  catch { return errorResponse("Studio storage is temporarily unavailable.", 503, "storage_unavailable"); }
}
