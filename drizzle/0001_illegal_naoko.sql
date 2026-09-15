CREATE TABLE `metric_proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`proposer_account_id` text NOT NULL,
	`name` text NOT NULL,
	`domain` text NOT NULL,
	`definition` text NOT NULL,
	`inclusion_criteria` text DEFAULT '' NOT NULL,
	`exclusion_criteria` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending_duplicate_review' NOT NULL,
	`duplicate_of_metric_id` text,
	`reviewer_account_id` text,
	`reviewer_comment` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_metric_proposals_proposer_status` ON `metric_proposals` (`proposer_account_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_metric_proposals_domain_status` ON `metric_proposals` (`domain`,`status`);