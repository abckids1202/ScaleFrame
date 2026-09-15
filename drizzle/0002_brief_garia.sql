CREATE TABLE `account_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`job_type` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`result_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_account_jobs_account_type_created` ON `account_jobs` (`account_id`,`job_type`,`created_at`);--> statement-breakpoint
CREATE TABLE `claim_evidence_links` (
	`id` text PRIMARY KEY NOT NULL,
	`claim_id` text NOT NULL,
	`evidence_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_claim_evidence_links_claim_evidence` ON `claim_evidence_links` (`claim_id`,`evidence_id`);--> statement-breakpoint
CREATE INDEX `idx_claim_evidence_links_claim` ON `claim_evidence_links` (`claim_id`);--> statement-breakpoint
CREATE TABLE `claims` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_account_id` text NOT NULL,
	`comparison_id` text,
	`comparison_category_id` text,
	`claim_text` text NOT NULL,
	`source_label` text NOT NULL,
	`source_url` text,
	`explanation` text NOT NULL,
	`counterargument` text NOT NULL,
	`reliability` text DEFAULT 'unrated' NOT NULL,
	`spoiler_level` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_claims_owner_id` ON `claims` (`owner_account_id`);--> statement-breakpoint
CREATE INDEX `idx_claims_comparison_category` ON `claims` (`comparison_id`,`comparison_category_id`);--> statement-breakpoint
CREATE TABLE `comparison_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`comparison_id` text NOT NULL,
	`revision_number` integer NOT NULL,
	`created_by_account_id` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`change_note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`published_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_comparison_revisions_comparison_revision` ON `comparison_revisions` (`comparison_id`,`revision_number`);--> statement-breakpoint
CREATE INDEX `idx_comparison_revisions_comparison_created` ON `comparison_revisions` (`comparison_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`request_count` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
