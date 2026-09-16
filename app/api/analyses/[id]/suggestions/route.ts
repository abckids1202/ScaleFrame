import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { analyses, analysisSuggestions, profiles } from "../../../../../db/schema";
import { getCurrentUser } from "../../../../../lib/auth";
import { errorResponse, jsonResponse, safeText, sameOrigin, validCsrf } from "../../../../../lib/http";
import { newId } from "../../../../../lib/ids";
import { enforceRateLimit, writeAudit } from "../../../../../lib/security";
import { analysisSuggestionSchema } from "../../../../../lib/validation";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = (await context.params).id; const user = await getCurrentUser(request);
  try {
    const analysis = (await getDb().select().from(analyses).where(eq(analyses.id, id)).limit(1))[0]; if (!analysis) return errorResponse("Analysis not found.", 404, "not_found");
    if (analysis.status !== "published" && analysis.ownerAccountId !== user?.subject) return errorResponse("Analysis not found.", 404, "not_found");
    const condition = analysis.ownerAccountId === user?.subject ? eq(analysisSuggestions.analysisId, id) : and(eq(analysisSuggestions.analysisId, id), eq(analysisSuggestions.status, "accepted"));
    const suggestions = await getDb().select({ id: analysisSuggestions.id, revisionNumber: analysisSuggestions.revisionNumber, blockId: analysisSuggestions.blockId, suggestionType: analysisSuggestions.suggestionType, body: analysisSuggestions.body, status: analysisSuggestions.status, resolutionNote: analysisSuggestions.resolutionNote, resolvedAt: analysisSuggestions.resolvedAt, createdAt: analysisSuggestions.createdAt, author: profiles.displayName, handle: profiles.handle }).from(analysisSuggestions).leftJoin(profiles, eq(profiles.accountId, analysisSuggestions.authorAccountId)).where(condition).orderBy(asc(analysisSuggestions.createdAt)).limit(100);
    return jsonResponse({ suggestions });
  } catch { return errorResponse("Suggestions are temporarily unavailable.", 503, "database_unavailable"); }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const user = await getCurrentUser(request); if (!user) return errorResponse("Sign in to suggest a review improvement.", 401, "authentication_required"); if (!user.emailVerified) return errorResponse("Verify your email before sending review suggestions.", 403, "email_verification_required");
  const parsed = analysisSuggestionSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return errorResponse("Choose a suggestion type and write a specific note.", 400, "validation_failed"); const id = (await context.params).id;
  try {
    const limit = await enforceRateLimit(`analysis_suggestion:${user.subject}`, 20, 3600); if (!limit.allowed) return errorResponse("Too many suggestions. Try again later.", 429, "rate_limited");
    const analysis = (await getDb().select().from(analyses).where(and(eq(analyses.id, id), eq(analyses.status, "published"))).limit(1))[0]; if (!analysis) return errorResponse("Analysis not found.", 404, "not_found");
    const suggestion = { id: newId("suggestion"), analysisId: id, revisionNumber: parsed.data.revisionNumber, blockId: safeText(parsed.data.blockId, 80) || null, authorAccountId: user.subject, suggestionType: parsed.data.suggestionType, body: parsed.data.body, status: "pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as const;
    await getDb().insert(analysisSuggestions).values(suggestion); await writeAudit(user.subject, "analysis.suggestion_created", "analysis", id, { suggestionType: suggestion.suggestionType, revisionNumber: suggestion.revisionNumber }); return jsonResponse({ suggestion }, { status: 201 });
  } catch { return errorResponse("The review suggestion could not be saved.", 503, "database_unavailable"); }
}
