CREATE TABLE `comparison_collaboration_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`comparison_id` text NOT NULL,
	`requester_account_id` text NOT NULL,
	`target_account_id` text,
	`target_handle` text,
	`message` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`response_note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`resolved_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_comparison_collab_comparison_status` ON `comparison_collaboration_requests` (`comparison_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_comparison_collab_requester` ON `comparison_collaboration_requests` (`requester_account_id`);--> statement-breakpoint
CREATE INDEX `idx_comparison_collab_target` ON `comparison_collaboration_requests` (`target_account_id`,`status`);--> statement-breakpoint
ALTER TABLE `comparisons` ADD `matchup_type` text DEFAULT 'character' NOT NULL;--> statement-breakpoint
ALTER TABLE `comparisons` ADD `participant_count_a` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `comparisons` ADD `participant_count_b` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `comparisons` ADD `score_mode` text DEFAULT 'scaled' NOT NULL;