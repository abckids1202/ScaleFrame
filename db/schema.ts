import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex, index } from "drizzle-orm/sqlite-core";

const id = (name: string) => text(name).primaryKey();
const createdAt = () => text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`);
const updatedAt = () => text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`);

export const accounts = sqliteTable("accounts", {
  id: id("id"), authSubject: text("auth_subject").notNull(), email: text("email").notNull(),
  role: text("role", { enum: ["user", "reviewer", "moderator", "admin"] }).notNull().default("user"),
  emailVerifiedAt: text("email_verified_at"), deletedAt: text("deleted_at"), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => ({ authSubjectUnique: uniqueIndex("uq_accounts_auth_subject").on(table.authSubject), emailIndex: index("idx_accounts_email").on(table.email) }));

export const profiles = sqliteTable("profiles", {
  id: id("id"), accountId: text("account_id").notNull(), handle: text("handle").notNull(), displayName: text("display_name").notNull(),
  bio: text("bio").notNull().default(""), avatarAssetId: text("avatar_asset_id"), preferencesJson: text("preferences_json").notNull().default("{}"), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => ({ handleUnique: uniqueIndex("uq_profiles_handle").on(table.handle), accountIndex: index("idx_profiles_account_id").on(table.accountId) }));

export const expertiseFacets = sqliteTable("expertise_facets", {
  id: id("id"), accountId: text("account_id").notNull(), domain: text("domain").notNull(), score: real("score").notNull().default(0), sampleCount: integer("sample_count").notNull().default(0), updatedAt: updatedAt(),
}, (table) => ({ facetIndex: uniqueIndex("uq_expertise_facets_account_domain").on(table.accountId, table.domain) }));

export const works = sqliteTable("works", {
  id: id("id"), slug: text("slug").notNull(), title: text("title").notNull(), workType: text("work_type").notNull(), description: text("description").notNull().default(""), creatorName: text("creator_name"), canonStatus: text("canon_status").notNull().default("community_catalogued"), spoilerLevel: integer("spoiler_level").notNull().default(0), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => ({ slugUnique: uniqueIndex("uq_works_slug").on(table.slug), titleIndex: index("idx_works_title").on(table.title) }));

export const characters = sqliteTable("characters", {
  id: id("id"), slug: text("slug").notNull(), canonicalName: text("canonical_name").notNull(), workId: text("work_id").notNull(), aliasesJson: text("aliases_json").notNull().default("[]"), description: text("description").notNull().default(""), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => ({ slugUnique: uniqueIndex("uq_characters_slug").on(table.slug), workIndex: index("idx_characters_work_id").on(table.workId) }));

export const characterVersions = sqliteTable("character_versions", {
  id: id("id"), characterId: text("character_id").notNull(), label: text("label").notNull(), continuity: text("continuity").notNull(), arcBoundary: text("arc_boundary").notNull().default(""), adaptation: text("adaptation").notNull().default(""), equipmentJson: text("equipment_json").notNull().default("[]"), stateJson: text("state_json").notNull().default("{}"), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => ({ characterIndex: index("idx_character_versions_character_id").on(table.characterId), continuityIndex: index("idx_character_versions_continuity").on(table.continuity) }));

export const metricVersions = sqliteTable("metric_versions", {
  id: id("id"), slug: text("slug").notNull(), name: text("name").notNull(), domain: text("domain").notNull(), family: text("family").notNull(), shortDefinition: text("short_definition").notNull(), fullDefinition: text("full_definition").notNull(), inclusionCriteria: text("inclusion_criteria").notNull().default(""), exclusionCriteria: text("exclusion_criteria").notNull().default(""), examplesJson: text("examples_json").notNull().default("[]"), antiExamplesJson: text("anti_examples_json").notNull().default("[]"), measurementType: text("measurement_type").notNull().default("judgment"), status: text("status").notNull().default("standardized"), version: integer("version").notNull().default(1), parentMetricId: text("parent_metric_id"), creatorAccountId: text("creator_account_id"), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => ({ slugVersionUnique: uniqueIndex("uq_metric_versions_slug_version").on(table.slug, table.version), domainIndex: index("idx_metric_versions_domain_family").on(table.domain, table.family) }));

export const metricProposals = sqliteTable("metric_proposals", {
  id: id("id"), proposerAccountId: text("proposer_account_id").notNull(), name: text("name").notNull(), domain: text("domain").notNull(), definition: text("definition").notNull(), inclusionCriteria: text("inclusion_criteria").notNull().default(""), exclusionCriteria: text("exclusion_criteria").notNull().default(""), status: text("status").notNull().default("pending_duplicate_review"), duplicateOfMetricId: text("duplicate_of_metric_id"), reviewerAccountId: text("reviewer_account_id"), reviewerComment: text("reviewer_comment").notNull().default(""), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => ({ proposerIndex: index("idx_metric_proposals_proposer_status").on(table.proposerAccountId, table.status), domainIndex: index("idx_metric_proposals_domain_status").on(table.domain, table.status) }));

export const metricPacks = sqliteTable("metric_packs", {
  id: id("id"), slug: text("slug").notNull(), name: text("name").notNull(), domain: text("domain").notNull(), description: text("description").notNull().default(""), status: text("status").notNull().default("curated"), ownerAccountId: text("owner_account_id"), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => ({ slugUnique: uniqueIndex("uq_metric_packs_slug").on(table.slug), domainIndex: index("idx_metric_packs_domain").on(table.domain) }));

export const metricPackItems = sqliteTable("metric_pack_items", {
  id: id("id"), packId: text("pack_id").notNull(), metricVersionId: text("metric_version_id").notNull(), defaultWeight: real("default_weight").notNull().default(1), displayOrder: integer("display_order").notNull().default(0),
}, (table) => ({ packMetricUnique: uniqueIndex("uq_metric_pack_items_pack_metric").on(table.packId, table.metricVersionId), packIndex: index("idx_metric_pack_items_pack_id").on(table.packId) }));

export const comparisons = sqliteTable("comparisons", {
  id: id("id"), slug: text("slug").notNull(), ownerAccountId: text("owner_account_id").notNull(), title: text("title").notNull(), domain: text("domain").notNull(), status: text("status").notNull().default("draft"), formatMode: text("format_mode").notNull().default("decisive"), spoilerLevel: integer("spoiler_level").notNull().default(0), contentRating: text("content_rating").notNull().default("general"), difficulty: text("difficulty").notNull().default("high_diff"), overallMethod: text("overall_method").notNull().default("normalized_weighted_score"), rulesJson: text("rules_json").notNull().default("{}"), revisionNumber: integer("revision_number").notNull().default(1), createdAt: createdAt(), updatedAt: updatedAt(), publishedAt: text("published_at"),
}, (table) => ({ slugUnique: uniqueIndex("uq_comparisons_slug").on(table.slug), ownerIndex: index("idx_comparisons_owner_status").on(table.ownerAccountId, table.status), publishedIndex: index("idx_comparisons_published_at").on(table.status, table.publishedAt) }));

export const comparisonParticipants = sqliteTable("comparison_participants", {
  id: id("id"), comparisonId: text("comparison_id").notNull(), characterVersionId: text("character_version_id").notNull(), side: text("side").notNull(), displayAlias: text("display_alias"), restrictionsJson: text("restrictions_json").notNull().default("{}"), displayOrder: integer("display_order").notNull().default(0),
}, (table) => ({ comparisonIndex: index("idx_comparison_participants_comparison_id").on(table.comparisonId) }));

export const comparisonCategories = sqliteTable("comparison_categories", {
  id: id("id"), comparisonId: text("comparison_id").notNull(), metricVersionId: text("metric_version_id").notNull(), weight: real("weight").notNull().default(1), scoreA: real("score_a"), scoreB: real("score_b"), winnerParticipantId: text("winner_participant_id"), confidence: real("confidence").notNull().default(0.5), explanation: text("explanation").notNull().default(""), counterargument: text("counterargument").notNull().default(""), displayOrder: integer("display_order").notNull().default(0),
}, (table) => ({ comparisonOrderIndex: index("idx_comparison_categories_comparison_order").on(table.comparisonId, table.displayOrder) }));

export const evidence = sqliteTable("evidence", {
  id: id("id"), ownerAccountId: text("owner_account_id").notNull(), sourceWorkId: text("source_work_id"), sourceReference: text("source_reference").notNull(), sourceType: text("source_type").notNull(), claim: text("claim").notNull(), contextNote: text("context_note").notNull().default(""), reliability: text("reliability").notNull().default("unrated"), provenanceJson: text("provenance_json").notNull().default("{}"), spoilerLevel: integer("spoiler_level").notNull().default(0), disputeStatus: text("dispute_status").notNull().default("undisputed"), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => ({ ownerIndex: index("idx_evidence_owner_id").on(table.ownerAccountId) }));

export const analyses = sqliteTable("analyses", {
  id: id("id"), slug: text("slug").notNull(), ownerAccountId: text("owner_account_id").notNull(), title: text("title").notNull(), domain: text("domain").notNull(), status: text("status").notNull().default("draft"), spoilerLevel: integer("spoiler_level").notNull().default(0), contentRating: text("content_rating").notNull().default("general"), currentRevision: integer("current_revision").notNull().default(1), createdAt: createdAt(), updatedAt: updatedAt(), publishedAt: text("published_at"),
}, (table) => ({ slugUnique: uniqueIndex("uq_analyses_slug").on(table.slug), ownerIndex: index("idx_analyses_owner_status").on(table.ownerAccountId, table.status) }));

export const analysisRevisions = sqliteTable("analysis_revisions", {
  id: id("id"), analysisId: text("analysis_id").notNull(), revisionNumber: integer("revision_number").notNull(), blocksJson: text("blocks_json").notNull().default("[]"), plainText: text("plain_text").notNull().default(""), changeNote: text("change_note").notNull().default(""), createdAt: createdAt(),
}, (table) => ({ revisionUnique: uniqueIndex("uq_analysis_revisions_analysis_revision").on(table.analysisId, table.revisionNumber) }));

export const studioProjects = sqliteTable("studio_projects", {
  id: id("id"), ownerAccountId: text("owner_account_id").notNull(), comparisonId: text("comparison_id"), name: text("name").notNull(), preset: text("preset").notNull().default("9:16"), projectJson: text("project_json").notNull().default("{}"), revisionNumber: integer("revision_number").notNull().default(1), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => ({ ownerIndex: index("idx_studio_projects_owner_id").on(table.ownerAccountId) }));

export const assets = sqliteTable("assets", {
  id: id("id"), ownerAccountId: text("owner_account_id").notNull(), objectKey: text("object_key").notNull(), contentType: text("content_type").notNull(), byteSize: integer("byte_size").notNull().default(0), status: text("status").notNull().default("pending"), provenanceJson: text("provenance_json").notNull().default("{}"), createdAt: createdAt(), deletedAt: text("deleted_at"),
}, (table) => ({ objectKeyUnique: uniqueIndex("uq_assets_object_key").on(table.objectKey), ownerIndex: index("idx_assets_owner_id").on(table.ownerAccountId) }));

export const notifications = sqliteTable("notifications", {
  id: id("id"), accountId: text("account_id").notNull(), type: text("type").notNull(), payloadJson: text("payload_json").notNull().default("{}"), readAt: text("read_at"), createdAt: createdAt(),
}, (table) => ({ inboxIndex: index("idx_notifications_account_read_created").on(table.accountId, table.readAt, table.createdAt) }));

export const moderationCases = sqliteTable("moderation_cases", {
  id: id("id"), reporterAccountId: text("reporter_account_id"), targetType: text("target_type").notNull(), targetId: text("target_id").notNull(), category: text("category").notNull(), description: text("description").notNull(), status: text("status").notNull().default("open"), assignedAccountId: text("assigned_account_id"), resolution: text("resolution"), createdAt: createdAt(), updatedAt: updatedAt(),
});

export const auditEvents = sqliteTable("audit_events", {
  id: id("id"), actorAccountId: text("actor_account_id"), action: text("action").notNull(), targetType: text("target_type").notNull(), targetId: text("target_id"), metadataJson: text("metadata_json").notNull().default("{}"), ipHash: text("ip_hash"), createdAt: createdAt(),
}, (table) => ({ actionIndex: index("idx_audit_events_action_created").on(table.action, table.createdAt), actorIndex: index("idx_audit_events_actor_created").on(table.actorAccountId, table.createdAt) }));
