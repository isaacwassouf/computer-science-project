CREATE TABLE `users` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`full_name` varchar(256),
	`email` varchar(256),
	`image_url` text,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
