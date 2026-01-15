CREATE TABLE `trackingHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shipmentId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`eventDescription` text NOT NULL,
	`location` varchar(255),
	`eventTimestamp` timestamp,
	`rawData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trackingHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `shipments` ADD `autoTrackingEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `shipments` ADD `lastTrackedAt` timestamp;--> statement-breakpoint
ALTER TABLE `shipments` ADD `trackingStatus` varchar(100);