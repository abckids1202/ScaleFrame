CREATE TABLE `analysis_claim_source_links` (
	`id` text PRIMARY KEY NOT NULL,
	`claim_id` text NOT NULL,
	`source_card_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_analysis_claim_source_link` ON `analysis_claim_source_links` (`claim_id`,`source_card_id`);--> statement-breakpoint
CREATE INDEX `idx_analysis_claim_source_links_claim` ON `analysis_claim_source_links` (`claim_id`);--> statement-breakpoint
CREATE TABLE `analysis_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`analysis_id` text NOT NULL,
	`revision_number` integer NOT NULL,
	`block_id` text,
	`claim_text` text NOT NULL,
	`explanation` text NOT NULL,
	`counterargument` text NOT NULL,
	`confidence` real DEFAULT 0.5 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_analysis_claims_analysis_revision` ON `analysis_claims` (`analysis_id`,`revision_number`);--> statement-breakpoint
CREATE INDEX `idx_analysis_claims_block` ON `analysis_claims` (`analysis_id`,`block_id`);--> statement-breakpoint
CREATE TABLE `analysis_source_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`analysis_id` text NOT NULL,
	`revision_number` integer NOT NULL,
	`label` text NOT NULL,
	`locator` text NOT NULL,
	`context` text DEFAULT '' NOT NULL,
	`source_url` text,
	`spoiler_level` integer DEFAULT 0 NOT NULL,
	`reliability` text DEFAULT 'unrated' NOT NULL,
	`provenance_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_analysis_sources_analysis_revision` ON `analysis_source_cards` (`analysis_id`,`revision_number`);--> statement-breakpoint
CREATE TABLE `analysis_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`analysis_id` text NOT NULL,
	`revision_number` integer NOT NULL,
	`block_id` text,
	`author_account_id` text NOT NULL,
	`suggestion_type` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`resolution_note` text,
	`resolved_by_account_id` text,
	`resolved_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_analysis_suggestions_analysis_status` ON `analysis_suggestions` (`analysis_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_analysis_suggestions_author` ON `analysis_suggestions` (`author_account_id`);--> statement-breakpoint
ALTER TABLE `analysis_subjects` ADD `version_label` text DEFAULT '' NOT NULL;