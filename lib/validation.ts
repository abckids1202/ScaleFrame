import { z } from "zod";

const safeUrl = z.string().trim().max(2000).refine((value) => value === "" || /^https:\/\//i.test(value), "Only HTTPS source URLs are allowed.");
export const comparisonCreateSchema = z.object({ title: z.string().trim().min(3).max(160), domain: z.enum(["WIS", "SCD", "WW"]), formatMode: z.enum(["decisive", "exploratory"]).default("decisive"), spoilerLevel: z.number().int().min(0).max(3).default(0), contentRating: z.enum(["general", "mature"]).default("general") });
export const comparisonRevisionSchema = z.object({ participants: z.array(z.object({ characterVersionId: z.string().min(1).max(160), side: z.enum(["A", "B"]), displayAlias: z.string().trim().max(120).optional() })).length(2), rules: z.string().trim().min(10).max(4000), assumptions: z.string().trim().max(4000).default(""), metrics: z.array(z.object({ metricVersionId: z.string().min(1).max(160), weight: z.number().finite().positive().max(100), scoreA: z.number().int().min(0).max(10), scoreB: z.number().int().min(0).max(10), confidence: z.number().finite().min(0).max(1), explanation: z.string().trim().min(10).max(4000), counterargument: z.string().trim().min(10).max(4000), claimId: z.string().min(1).max(160) })).min(1).max(100), overallMethod: z.literal("normalized_weighted_score"), difficulty: z.enum(["no_diff", "low_diff", "mid_diff", "high_diff", "extreme"]), checklist: z.object({ versions: z.literal(true), rules: z.literal(true), labels: z.literal(true), metrics: z.literal(true), evidence: z.literal(true), method: z.literal(true) }) });

const safeHttpsUrl = z.string().trim().url().refine((value) => value.startsWith("https://"), "Only HTTPS source URLs are allowed.");
export const analysisRevisionSchema = z.object({
  blocks: z.array(z.object({ id: z.string().min(1).max(80), type: z.enum(["heading", "paragraph", "quote", "note"]), heading: z.string().trim().max(180).default(""), body: z.string().trim().min(1).max(10000) })).max(50).default([]),
  sources: z.array(z.object({ label: z.string().trim().min(2).max(180), locator: z.string().trim().min(2).max(240), context: z.string().trim().max(2000).default(""), sourceUrl: safeHttpsUrl.optional().or(z.literal("")), spoilerLevel: z.number().int().min(0).max(3).default(0), reliability: z.enum(["high", "medium", "low", "unrated"]).default("unrated") })).max(50).default([]),
  claims: z.array(z.object({ blockId: z.string().max(80).optional(), claimText: z.string().trim().min(10).max(2000), explanation: z.string().trim().min(10).max(4000), counterargument: z.string().trim().min(10).max(4000), confidence: z.number().finite().min(0).max(1), sourceIndexes: z.array(z.number().int().min(0).max(49)).max(20).default([]) })).max(50).default([]),
  changeNote: z.string().trim().max(240).default(""),
});

export const analysisSuggestionSchema = z.object({
  revisionNumber: z.number().int().min(1), blockId: z.string().trim().max(80).optional(), suggestionType: z.enum(["clarification", "correction", "source_request"]), body: z.string().trim().min(5).max(2000),
});
export const claimSchema = z.object({ comparisonId: z.string().min(1).max(160).optional(), comparisonCategoryId: z.string().min(1).max(160).optional(), claimText: z.string().trim().min(10).max(4000), sourceLabel: z.string().trim().min(2).max(240), sourceUrl: safeUrl.default(""), explanation: z.string().trim().min(10).max(4000), counterargument: z.string().trim().min(10).max(4000), reliability: z.enum(["high", "medium", "low", "unrated"]).default("unrated"), spoilerLevel: z.number().int().min(0).max(3).default(0) });
