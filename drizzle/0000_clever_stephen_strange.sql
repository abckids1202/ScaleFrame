CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_subject` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`email_verified_at` text,
	`deleted_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_accounts_auth_subject` ON `accounts` (`auth_subject`);--> statement-breakpoint
CREATE INDEX `idx_accounts_email` ON `accounts` (`email`);--> statement-breakpoint
CREATE TABLE `analyses` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`owner_account_id` text NOT NULL,
	`title` text NOT NULL,
	`domain` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`spoiler_level` integer DEFAULT 0 NOT NULL,
	`content_rating` text DEFAULT 'general' NOT NULL,
	`current_revision` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`published_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_analyses_slug` ON `analyses` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_analyses_owner_status` ON `analyses` (`owner_account_id`,`status`);--> statement-breakpoint
CREATE TABLE `analysis_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`analysis_id` text NOT NULL,
	`revision_number` integer NOT NULL,
	`blocks_json` text DEFAULT '[]' NOT NULL,
	`plain_text` text DEFAULT '' NOT NULL,
	`change_note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_analysis_revisions_analysis_revision` ON `analysis_revisions` (`analysis_id`,`revision_number`);--> statement-breakpoint
CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_account_id` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`byte_size` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`provenance_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_assets_object_key` ON `assets` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_assets_owner_id` ON `assets` (`owner_account_id`);--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_account_id` text,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`ip_hash` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_events_action_created` ON `audit_events` (`action`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_events_actor_created` ON `audit_events` (`actor_account_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `character_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`character_id` text NOT NULL,
	`label` text NOT NULL,
	`continuity` text NOT NULL,
	`arc_boundary` text DEFAULT '' NOT NULL,
	`adaptation` text DEFAULT '' NOT NULL,
	`equipment_json` text DEFAULT '[]' NOT NULL,
	`state_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_character_versions_character_id` ON `character_versions` (`character_id`);--> statement-breakpoint
CREATE INDEX `idx_character_versions_continuity` ON `character_versions` (`continuity`);--> statement-breakpoint
CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`canonical_name` text NOT NULL,
	`work_id` text NOT NULL,
	`aliases_json` text DEFAULT '[]' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_characters_slug` ON `characters` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_characters_work_id` ON `characters` (`work_id`);--> statement-breakpoint
CREATE TABLE `comparison_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`comparison_id` text NOT NULL,
	`metric_version_id` text NOT NULL,
	`weight` real DEFAULT 1 NOT NULL,
	`score_a` real,
	`score_b` real,
	`winner_participant_id` text,
	`confidence` real DEFAULT 0.5 NOT NULL,
	`explanation` text DEFAULT '' NOT NULL,
	`counterargument` text DEFAULT '' NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_comparison_categories_comparison_order` ON `comparison_categories` (`comparison_id`,`display_order`);--> statement-breakpoint
CREATE TABLE `comparison_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`comparison_id` text NOT NULL,
	`character_version_id` text NOT NULL,
	`side` text NOT NULL,
	`display_alias` text,
	`restrictions_json` text DEFAULT '{}' NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_comparison_participants_comparison_id` ON `comparison_participants` (`comparison_id`);--> statement-breakpoint
CREATE TABLE `comparisons` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`owner_account_id` text NOT NULL,
	`title` text NOT NULL,
	`domain` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`format_mode` text DEFAULT 'decisive' NOT NULL,
	`spoiler_level` integer DEFAULT 0 NOT NULL,
	`content_rating` text DEFAULT 'general' NOT NULL,
	`difficulty` text DEFAULT 'high_diff' NOT NULL,
	`overall_method` text DEFAULT 'normalized_weighted_score' NOT NULL,
	`rules_json` text DEFAULT '{}' NOT NULL,
	`revision_number` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`published_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_comparisons_slug` ON `comparisons` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_comparisons_owner_status` ON `comparisons` (`owner_account_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_comparisons_published_at` ON `comparisons` (`status`,`published_at`);--> statement-breakpoint
CREATE TABLE `evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_account_id` text NOT NULL,
	`source_work_id` text,
	`source_reference` text NOT NULL,
	`source_type` text NOT NULL,
	`claim` text NOT NULL,
	`context_note` text DEFAULT '' NOT NULL,
	`reliability` text DEFAULT 'unrated' NOT NULL,
	`provenance_json` text DEFAULT '{}' NOT NULL,
	`spoiler_level` integer DEFAULT 0 NOT NULL,
	`dispute_status` text DEFAULT 'undisputed' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_evidence_owner_id` ON `evidence` (`owner_account_id`);--> statement-breakpoint
CREATE TABLE `expertise_facets` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`domain` text NOT NULL,
	`score` real DEFAULT 0 NOT NULL,
	`sample_count` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_expertise_facets_account_domain` ON `expertise_facets` (`account_id`,`domain`);--> statement-breakpoint
CREATE TABLE `metric_pack_items` (
	`id` text PRIMARY KEY NOT NULL,
	`pack_id` text NOT NULL,
	`metric_version_id` text NOT NULL,
	`default_weight` real DEFAULT 1 NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_metric_pack_items_pack_metric` ON `metric_pack_items` (`pack_id`,`metric_version_id`);--> statement-breakpoint
CREATE INDEX `idx_metric_pack_items_pack_id` ON `metric_pack_items` (`pack_id`);--> statement-breakpoint
CREATE TABLE `metric_packs` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`domain` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'curated' NOT NULL,
	`owner_account_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_metric_packs_slug` ON `metric_packs` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_metric_packs_domain` ON `metric_packs` (`domain`);--> statement-breakpoint
CREATE TABLE `metric_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`domain` text NOT NULL,
	`family` text NOT NULL,
	`short_definition` text NOT NULL,
	`full_definition` text NOT NULL,
	`inclusion_criteria` text DEFAULT '' NOT NULL,
	`exclusion_criteria` text DEFAULT '' NOT NULL,
	`examples_json` text DEFAULT '[]' NOT NULL,
	`anti_examples_json` text DEFAULT '[]' NOT NULL,
	`measurement_type` text DEFAULT 'judgment' NOT NULL,
	`status` text DEFAULT 'standardized' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`parent_metric_id` text,
	`creator_account_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_metric_versions_slug_version` ON `metric_versions` (`slug`,`version`);--> statement-breakpoint
CREATE INDEX `idx_metric_versions_domain_family` ON `metric_versions` (`domain`,`family`);--> statement-breakpoint
CREATE TABLE `moderation_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_account_id` text,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`assigned_account_id` text,
	`resolution` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`type` text NOT NULL,
	`payload_json` text DEFAULT '{}' NOT NULL,
	`read_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_notifications_account_read_created` ON `notifications` (`account_id`,`read_at`,`created_at`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`handle` text NOT NULL,
	`display_name` text NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`avatar_asset_id` text,
	`preferences_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_profiles_handle` ON `profiles` (`handle`);--> statement-breakpoint
CREATE INDEX `idx_profiles_account_id` ON `profiles` (`account_id`);--> statement-breakpoint
CREATE TABLE `studio_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_account_id` text NOT NULL,
	`comparison_id` text,
	`name` text NOT NULL,
	`preset` text DEFAULT '9:16' NOT NULL,
	`project_json` text DEFAULT '{}' NOT NULL,
	`revision_number` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_studio_projects_owner_id` ON `studio_projects` (`owner_account_id`);--> statement-breakpoint
CREATE TABLE `works` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`work_type` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`creator_name` text,
	`canon_status` text DEFAULT 'community_catalogued' NOT NULL,
	`spoiler_level` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_works_slug` ON `works` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_works_title` ON `works` (`title`);