ALTER TABLE `users` ADD `notifyOnStatusChange` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifyOnDelay` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifyOnArrival` int DEFAULT 1 NOT NULL;