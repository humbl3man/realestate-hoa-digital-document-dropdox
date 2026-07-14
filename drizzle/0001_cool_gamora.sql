ALTER TABLE `portals` ADD `description` text;--> statement-breakpoint
ALTER TABLE `portals` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `stripe_account_id` text;