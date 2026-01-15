CREATE TABLE `emailDigestQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`digestType` enum('hourly','daily','weekly') NOT NULL,
	`scheduledFor` timestamp NOT NULL,
	`sent` int NOT NULL DEFAULT 0,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailDigestQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhookEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shipmentId` int,
	`containerNumber` varchar(255),
	`eventType` varchar(100) NOT NULL,
	`eventData` text NOT NULL,
	`source` varchar(100),
	`processed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhookEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `emailFrequency` enum('immediate','hourly','daily','weekly') DEFAULT 'immediate' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifyContainerUpdates` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifyDischargeDateChanges` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notifyMissingDocuments` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `quietHoursStart` varchar(5);--> statement-breakpoint
ALTER TABLE `users` ADD `quietHoursEnd` varchar(5);--> statement-breakpoint
ALTER TABLE `users` ADD `timezone` varchar(50) DEFAULT 'UTC' NOT NULL;