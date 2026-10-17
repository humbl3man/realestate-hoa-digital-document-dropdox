ALTER TABLE `user` ADD `stripe_details_submitted` integer;--> statement-breakpoint
CREATE INDEX `documents_portalId_idx` ON `documents` (`portal_id`);--> statement-breakpoint
CREATE INDEX `portals_userId_idx` ON `portals` (`user_id`);