CREATE TABLE `apiConfigs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mode` varchar(50) NOT NULL,
	`carrier` varchar(100),
	`url` varchar(500) NOT NULL,
	`port` varchar(10),
	`token` text,
	`username` varchar(255),
	`password` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apiConfigs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shipmentId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`fileType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`uploadedBy` varchar(255) NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shipmentId` int NOT NULL,
	`text` text NOT NULL,
	`author` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(255),
	`label` varchar(255),
	`supplier` varchar(255),
	`cro` varchar(255),
	`container` varchar(255) NOT NULL,
	`mawbNumber` varchar(255),
	`carrier` varchar(255) NOT NULL,
	`status` varchar(100) NOT NULL,
	`pol` varchar(255),
	`pod` varchar(255),
	`atd` varchar(255),
	`eta` varchar(255) NOT NULL,
	`ata` varchar(255),
	`bolNumber` varchar(255),
	`shipmentType` varchar(50) DEFAULT 'ocean',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`)
);
