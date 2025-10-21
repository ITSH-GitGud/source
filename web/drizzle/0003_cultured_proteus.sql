CREATE TABLE `unifi_config` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`controller_url` text NOT NULL,
	`api_key` text NOT NULL,
	`network_id` text NOT NULL,
	`network_name` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
