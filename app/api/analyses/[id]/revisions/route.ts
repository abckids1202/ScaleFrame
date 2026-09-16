import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { analyses, analysisClaimSourceLinks, analysisClaims, analysisRevisions, analysisSourceCards } from "../../../../../db/schema";
import { getCurrentUser } from "../../../../../lib/auth";
import { errorResponse, jsonResponse, safeText, sameOrigin, validCsrf } from "../../../../../lib/http";
import { newId } from "../../../../../lib/ids";
import { enforceRateLimit, writeAudit } from "../../../../../lib/security";
import { analysisRevisionSchema } from "../../../../../lib/validation";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to save this research draft.", 401, "authentication_required");
  const id = (await context.params).id; const parsed = analysisRevisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("Add readable blocks, source cards, and complete claims before saving.", 400, "validation_failed");
  try {
    const limit = await enforceRateLimit(`analysis_revision:${user.subject}`, 60, 3600); if (!limit.allowed) return errorResponse("Too many saves. Try again later.", 429, "rate_limited");
    const db = getDb(); const analysis = (await db.select().from(analyses).where(and(eq(analyses.id, id), eq(analyses.ownerAccountId, user.subject))).limit(1))[0];
    if (!analysis || analysis.status === "deleted") return errorResponse("Analysis draft not found.", 404, "not_found");
    const revisionNumber = analysis.currentRevision + 1; const now = new Date().toISOString(); const blocks = parsed.data.blocks; const plainText = blocks.map((block) => `${block.heading}\n${block.body}`).join("\n\n");
    await db.insert(analysisRevisions).values({ id: newId("analysisrev"), analysisId: id, revisionNumber, blocksJson: JSON.stringify(blocks), plainText, changeNote: safeText(parsed.data.changeNote, 240), createdAt: now });
    const sources = parsed.data.sources.map((source) => ({ id: newId("analysis-source"), analysisId: id, revisionNumber, label: source.label, locator: source.locator, context: source.context, sourceUrl: source.sourceUrl || null, spoilerLevel: source.spoilerLevel, reliability: source.reliability, provenanceJson: JSON.stringify({ enteredBy: user.subject }), createdAt: now }));
    if (sources.length) await db.insert(analysisSourceCards).values(sources);
    for (const claim of parsed.data.claims) {
      const claimId = newId("analysis-claim"); await db.insert(analysisClaims).values({ id: claimId, analysisId: id, revisionNumber, blockId: claim.blockId || null, claimText: claim.claimText, explanation: claim.explanation, counterargument: claim.counterargument, confidence: claim.confidence, createdAt: now, updatedAt: now });
      const links = claim.sourceIndexes.map((index) => sources[index]).filter(Boolean).map((source) => ({ id: newId("claim-source"), claimId, sourceCardId: source.id, createdAt: now })); if (links.length) await db.insert(analysisClaimSourceLinks).values(links);
    }
    await db.update(analyses).set({ currentRevision: revisionNumber, summary: analysis.summary, updatedAt: now }).where(eq(analyses.id, id));
    await writeAudit(user.subject, "analysis.revision_created", "analysis", id, { revisionNumber, blocks: blocks.length, sources: sources.length, claims: parsed.data.claims.length });
    return jsonResponse({ revisionNumber, savedAt: now }, { status: 201 });
  } catch { return errorResponse("The research revision could not be saved.", 503, "database_unavailable"); }
}
