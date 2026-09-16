CREATE TABLE `analysis_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`analysis_id` text NOT NULL,
	`revision_number` integer DEFAULT 1 NOT NULL,
	`author_account_id` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'visible' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_analysis_comments_analysis_created` ON `analysis_comments` (`analysis_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_analysis_comments_author` ON `analysis_comments` (`author_account_id`);--> statement-breakpoint
CREATE TABLE `analysis_subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`analysis_id` text NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text,
	`label` text NOT NULL,
	`role` text DEFAULT 'primary' NOT NULL,
	`aspect` text DEFAULT 'General' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_analysis_subjects_analysis` ON `analysis_subjects` (`analysis_id`);--> statement-breakpoint
CREATE INDEX `idx_analysis_subjects_subject` ON `analysis_subjects` (`subject_type`,`subject_id`);--> statement-breakpoint
CREATE TABLE `analysis_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`analysis_id` text NOT NULL,
	`tag` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_analysis_tags_analysis_tag` ON `analysis_tags` (`analysis_id`,`tag`);--> statement-breakpoint
CREATE INDEX `idx_analysis_tags_tag` ON `analysis_tags` (`tag`);--> statement-breakpoint
ALTER TABLE `analyses` ADD `subject_type` text DEFAULT 'character' NOT NULL;--> statement-breakpoint
ALTER TABLE `analyses` ADD `subject_label` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `analyses` ADD `aspect` text DEFAULT 'General' NOT NULL;--> statement-breakpoint
ALTER TABLE `analyses` ADD `summary` text DEFAULT '' NOT NULL;