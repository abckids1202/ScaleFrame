import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { seedCharacters, seedComparisons, seedMetrics, seedWorks } from "../db/seed-data.ts";
import { researchCatalog } from "../lib/analysis-catalog.ts";

const sql = (value: string | number | null) => value === null ? "NULL" : typeof value === "number" ? String(value) : `'${value.replaceAll("'", "''")}'`;
const lines: string[] = ["PRAGMA foreign_keys = ON;"];
const insert = (table: string, columns: string[], values: Array<string | number | null>) => lines.push(`INSERT OR IGNORE INTO ${table} (${columns.join(",")}) VALUES (${values.map(sql).join(",")});`);

insert("accounts", ["id", "auth_subject", "email", "role"], ["system_seed", "system_seed", "system@scaleframe.invalid", "admin"]);
insert("profiles", ["id", "account_id", "handle", "display_name"], ["profile_system_seed", "system_seed", "scaleframe", "ScaleFrame Catalog"]);
for (const work of seedWorks) insert("works", ["id", "slug", "title", "work_type", "description", "creator_name", "canon_status"], [`seed-work-${work.slug}`, work.slug, work.title, work.type, work.description, work.creator, "canonical_reference"]);
for (const character of seedCharacters) {
  const characterId = `seed-character-${character.slug}`; const work = seedWorks.find((item) => item.title === character.work);
  insert("characters", ["id", "slug", "canonical_name", "work_id", "aliases_json", "description"], [characterId, character.slug, character.name, work ? `seed-work-${work.slug}` : null, "[]", "Curated catalog character."]);
  character.versions.forEach((label, index) => insert("character_versions", ["id", "character_id", "label", "continuity", "arc_boundary", "adaptation"], [`seed-version-${character.slug}-${index + 1}`, characterId, label, "seed canon", "", "catalog reference"]));
}
for (const metric of seedMetrics) insert("metric_versions", ["id", "slug", "name", "domain", "family", "short_definition", "full_definition", "inclusion_criteria", "exclusion_criteria", "examples_json", "anti_examples_json", "measurement_type", "status", "version", "creator_account_id"], [`seed-metric-${metric.slug}-v1`, metric.slug, metric.name, metric.domain, metric.family, metric.definition, metric.definition, "Use only evidence relevant to the declared version and rules.", "Do not substitute popularity or unrelated feats.", "[]", "[]", "judgment", metric.status, 1, "system_seed"]);
for (const domain of ["WIS", "SCD", "WW"]) {
  const packId = `seed-pack-${domain.toLowerCase()}`; insert("metric_packs", ["id", "slug", "name", "domain", "description", "status", "owner_account_id"], [packId, `${domain.toLowerCase()}-core`, `${domain} Core`, domain, `Curated ${domain} metrics for transparent comparison drafts.`, "curated", "system_seed"]);
  seedMetrics.filter((metric) => metric.domain === domain).forEach((metric, index) => insert("metric_pack_items", ["id", "pack_id", "metric_version_id", "default_weight", "display_order"], [`seed-pack-item-${domain.toLowerCase()}-${metric.slug}`, packId, `seed-metric-${metric.slug}-v1`, metric.defaultWeight, index]));
}
for (const analysis of researchCatalog) {
  const analysisId = analysis.id;
  insert("analyses", ["id", "slug", "owner_account_id", "title", "domain", "subject_type", "subject_label", "aspect", "summary", "status", "spoiler_level", "content_rating", "current_revision", "published_at"], [analysisId, analysis.slug, "system_seed", analysis.title, analysis.domain, analysis.subjectType, analysis.subjectLabel, analysis.aspect, analysis.summary, "published", 0, "general", Number(analysis.revision), "2026-01-01T00:00:00.000Z"]);
  insert("analysis_revisions", ["id", "analysis_id", "revision_number", "blocks_json", "plain_text", "change_note"], [`seed-analysis-revision-${analysis.slug}`, analysisId, Number(analysis.revision), "[]", analysis.summary, "Initial curated research import"]);
  insert("analysis_subjects", ["id", "analysis_id", "subject_type", "label", "aspect"], [`seed-analysis-subject-${analysis.slug}`, analysisId, analysis.subjectType, analysis.subjectLabel, analysis.aspect]);
  for (const tag of analysis.tags) insert("analysis_tags", ["id", "analysis_id", "tag"], [`seed-analysis-tag-${analysis.slug}-${tag.replaceAll(" ", "-")}`, analysisId, tag]);
  insert("analysis_comments", ["id", "analysis_id", "revision_number", "author_account_id", "body", "status"], [`seed-analysis-comment-${analysis.slug}`, analysisId, Number(analysis.revision), "system_seed", "Useful framing. I would love to see the strongest counter-reading attached to the next revision.", "visible"]);
}
for (const comparison of seedComparisons) {
  const comparisonId = `seed-comparison-${comparison.slug}`; insert("comparisons", ["id", "slug", "owner_account_id", "title", "domain", "status", "format_mode", "content_rating", "difficulty", "overall_method", "revision_number", "published_at"], [comparisonId, comparison.slug, "system_seed", comparison.title, comparison.domain, "published", comparison.winner === "Exploratory" ? "exploratory" : "decisive", "general", comparison.difficulty.toLowerCase().replaceAll(" ", "_"), "normalized_weighted_score", 1, "2026-01-01T00:00:00.000Z"]);
  const names = comparison.title.split(" vs "); const participantSlugs = names.map((name) => seedCharacters.find((character) => character.name === name)?.slug ?? ""); const participantIds = [`seed-participant-${comparison.slug}-a`, `seed-participant-${comparison.slug}-b`];
  participantSlugs.forEach((characterSlug, index) => { const character = seedCharacters.find((item) => item.slug === characterSlug); if (character) insert("comparison_participants", ["id", "comparison_id", "character_version_id", "side", "display_order"], [participantIds[index], comparisonId, `seed-version-${character.slug}-1`, index === 0 ? "A" : "B", index]); });
  const metrics = seedMetrics.filter((metric) => metric.domain === comparison.domain); const rows = metrics.map((metric, index) => { const a = comparison.winner === "Exploratory" ? 5 : comparison.winner === names[0] ? 7 + (index % 2) : 4 + (index % 2); const b = comparison.winner === "Exploratory" ? 5 : comparison.winner === names[1] ? 7 + (index % 2) : 4 + (index % 2); const claimId = `seed-claim-${comparison.slug}-${metric.slug}`; insert("claims", ["id", "owner_account_id", "comparison_id", "claim_text", "source_label", "explanation", "counterargument", "reliability"], [claimId, "system_seed", comparisonId, `${metric.name} is evaluated under the declared ${comparison.domain} rules.`, `${comparison.title} / catalog note`, "The result is illustrative seed content and should be replaced or expanded by an author with source-specific reasoning.", "The seed result is not a substitute for a complete argument.", "unrated"]); return { metricVersionId: `seed-metric-${metric.slug}-v1`, weight: metric.defaultWeight, scoreA: a, scoreB: b, confidence: .7, explanation: "Seed explanation pending author expansion.", counterargument: "Seed counterargument pending author expansion.", claimId }; });
  const snapshot = { participants: participantSlugs.map((characterSlug, index) => ({ characterVersionId: `seed-version-${characterSlug}-1`, side: index === 0 ? "A" : "B" })), rules: "Seed catalog comparison; replace with explicit author rules.", assumptions: "", metrics: rows, overallMethod: "normalized_weighted_score", difficulty: comparison.difficulty.toLowerCase().replaceAll(" ", "_"), checklist: { versions: true, rules: true, labels: true, metrics: true, evidence: true, method: true }, calculation: { source: "seed-import" } };
  insert("comparison_revisions", ["id", "comparison_id", "revision_number", "created_by_account_id", "snapshot_json", "change_note", "published_at"], [`seed-revision-${comparison.slug}-1`, comparisonId, 1, "system_seed", JSON.stringify(snapshot), "Initial curated seed import", "2026-01-01T00:00:00.000Z"]);
}

const output = join(tmpdir(), `scaleframe-seed-${Date.now()}.sql`); writeFileSync(output, `${lines.join("\n")}\n`, "utf8"); const remote = process.argv.includes("--remote"); const database = process.argv.find((value) => value.startsWith("--database="))?.slice("--database=".length) || "DB"; const wrangler = fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url)); execFileSync(process.execPath, [wrangler, "d1", "execute", database, remote ? "--remote" : "--local", "--config", "dist/server/wrangler.json", `--file=${output}`], { stdio: "inherit" });
