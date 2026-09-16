import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { analyses, analysisSubjects, analysisTags, analysisRevisions, analysisComments } from "../../../db/schema";
import { getCurrentUser } from "../../../lib/auth";
import { syncAccount } from "../../../lib/accounts";
import { errorResponse, jsonResponse, safeText, sameOrigin, validCsrf } from "../../../lib/http";
import { newId, slugify } from "../../../lib/ids";
import { enforceRateLimit, writeAudit } from "../../../lib/security";
import { researchCatalog } from "../../../lib/analysis-catalog";

const domains = new Set(["WIS", "SCD", "WW"]);
const subjectTypes = new Set(["character", "work", "aspect"]);

function cleanTags(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((tag) => safeText(tag, 32).toLowerCase().replace(/[^a-z0-9 -]/g, "").trim()).filter(Boolean))].slice(0, 12);
}

function filterAnalyses<T extends { title: string; summary?: string; subjectLabel: string; aspect: string; domain: string; subjectType: string; tags: string[] }>(items: T[], filters: { query: string; domain: string; tag: string; subjectType: string }) {
  return items.filter((item) => {
    const haystack = `${item.title} ${item.summary ?? ""} ${item.subjectLabel} ${item.aspect} ${item.tags.join(" ")}`.toLowerCase();
    return (!filters.query || haystack.includes(filters.query)) && (!filters.domain || item.domain === filters.domain) && (!filters.tag || item.tags.includes(filters.tag)) && (!filters.subjectType || item.subjectType === filters.subjectType);
  });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const filters = { query: params.get("q")?.trim().toLowerCase() ?? "", domain: params.get("domain")?.toUpperCase() ?? "", tag: params.get("tag")?.trim().toLowerCase() ?? "", subjectType: params.get("subjectType")?.toLowerCase() ?? "" };
  try {
    const rows = await getDb().select().from(analyses).where(eq(analyses.status, "published")).orderBy(desc(analyses.publishedAt)).limit(100);
    const results = await Promise.all(rows.map(async (row) => {
      const [tags, subjects, comments] = await Promise.all([
        getDb().select().from(analysisTags).where(eq(analysisTags.analysisId, row.id)),
        getDb().select().from(analysisSubjects).where(eq(analysisSubjects.analysisId, row.id)),
        getDb().select().from(analysisComments).where(eq(analysisComments.analysisId, row.id)),
      ]);
      return { ...row, tags: tags.map((item) => item.tag), subjects, author: "Community researcher", readTime: "Open study", comments: comments.length, revision: String(row.currentRevision).padStart(2, "0") };
    }));
    if (!rows.length) return jsonResponse({ source: "seed-fallback", analyses: filterAnalyses(researchCatalog, filters) });
    return jsonResponse({ source: "d1", analyses: filterAnalyses(results, filters) });
  } catch {
    return jsonResponse({ source: "seed-fallback", analyses: filterAnalyses(researchCatalog, filters) });
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request) || !validCsrf(request)) return errorResponse("CSRF validation failed.", 403, "csrf_rejected");
  const user = await getCurrentUser(request);
  if (!user) return errorResponse("Sign in to start a private research draft.", 401, "authentication_required");
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  const title = safeText(payload?.title, 160); const domain = safeText(payload?.domain, 8).toUpperCase(); const subjectType = safeText(payload?.subjectType, 20).toLowerCase(); const subjectLabel = safeText(payload?.subjectLabel, 160); const aspect = safeText(payload?.aspect, 160) || "General"; const summary = safeText(payload?.summary, 600); const tags = cleanTags(payload?.tags); const spoilerLevel = Number(payload?.spoilerLevel ?? 0); const contentRating = safeText(payload?.contentRating, 20) || "general";
  if (!title || !domains.has(domain) || !subjectTypes.has(subjectType) || !subjectLabel || !Number.isInteger(spoilerLevel) || spoilerLevel < 0 || spoilerLevel > 3 || !["general", "mature"].includes(contentRating)) return errorResponse("Title, lens, subject, and content labels are required.", 400, "validation_failed");
  try {
    const limit = await enforceRateLimit(`analysis_create:${user.subject}`, 30, 3600); if (!limit.allowed) return errorResponse("Too many new research drafts. Try again later.", 429, "rate_limited");
    const db = getDb(); await syncAccount({ id: user.subject, email: user.email, email_confirmed_at: null }); const id = newId("analysis"); const slug = `${slugify(title)}-${id.slice(-8)}`;
    await db.insert(analyses).values({ id, slug, ownerAccountId: user.subject, title, domain, subjectType, subjectLabel, aspect, summary, status: "draft", spoilerLevel, contentRating, currentRevision: 1 });
    await db.insert(analysisRevisions).values({ id: newId("analysisrev"), analysisId: id, revisionNumber: 1, blocksJson: "[]", plainText: "", changeNote: "Research brief created" });
    await db.insert(analysisSubjects).values({ id: newId("subject"), analysisId: id, subjectType, subjectId: null, label: subjectLabel, aspect });
    if (tags.length) await db.insert(analysisTags).values(tags.map((tag) => ({ id: newId("analysistag"), analysisId: id, tag })));
    await writeAudit(user.subject, "analysis.created", "analysis", id, { domain, subjectType, tags });
    return jsonResponse({ id, slug, status: "draft" }, { status: 201 });
  } catch { return errorResponse("Research draft storage is temporarily unavailable.", 503, "storage_unavailable"); }
}
