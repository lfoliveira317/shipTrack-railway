CREATE TABLE `documentTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documentTypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `documentTypes_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `attachments` ADD `documentType` varchar(255);