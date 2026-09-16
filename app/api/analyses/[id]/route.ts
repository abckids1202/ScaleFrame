import { and, eq, or } from "drizzle-orm";
import { getDb } from "../../../../db";
import { analyses, analysisRevisions, analysisSubjects, analysisTags } from "../../../../db/schema";
import { getCurrentUser } from "../../../../lib/auth";
import { errorResponse, jsonResponse } from "../../../../lib/http";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = (await context.params).id;
  try {
    const db = getDb(); const user = await getCurrentUser(request);
    const conditions = user ? or(eq(analyses.id, id), eq(analyses.slug, id)) : and(eq(analyses.status, "published"), or(eq(analyses.id, id), eq(analyses.slug, id)));
    const analysis = (await db.select().from(analyses).where(conditions).limit(1))[0];
    if (!analysis || (analysis.status !== "published" && analysis.ownerAccountId !== user?.subject)) return errorResponse("Analysis not found.", 404, "not_found");
    const [tags, subjects, revision] = await Promise.all([
      db.select().from(analysisTags).where(eq(analysisTags.analysisId, analysis.id)),
      db.select().from(analysisSubjects).where(eq(analysisSubjects.analysisId, analysis.id)),
      db.select().from(analysisRevisions).where(and(eq(analysisRevisions.analysisId, analysis.id), eq(analysisRevisions.revisionNumber, analysis.currentRevision))).limit(1),
    ]);
    return jsonResponse({ analysis: { ...analysis, tags: tags.map((item) => item.tag), subjects, revision: revision[0] ?? null } });
  } catch { return errorResponse("Analysis storage is temporarily unavailable.", 503, "database_unavailable"); }
}
