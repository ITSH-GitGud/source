CREATE TABLE `sensor_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sensor_id` text NOT NULL,
	`timestamp` integer NOT NULL,
	`value` text NOT NULL,
	`unit` text,
	`metadata` text,
	`received_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`sensor_id`) REFERENCES `sensors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sensor_data_sensor_id_idx` ON `sensor_data` (`sensor_id`);--> statement-breakpoint
CREATE INDEX `sensor_data_timestamp_idx` ON `sensor_data` (`timestamp`);--> statement-breakpoint
CREATE INDEX `sensor_data_sensor_timestamp_idx` ON `sensor_data` (`sensor_id`,`timestamp`);--> statement-breakpoint
CREATE TABLE `sensors` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`device_id` text,
	`name` text NOT NULL,
	`measurement_type` text NOT NULL,
	`location` text,
	`status` text DEFAULT 'active' NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `sensors_user_id_idx` ON `sensors` (`user_id`);--> statement-breakpoint
CREATE INDEX `sensors_device_id_idx` ON `sensors` (`device_id`);--> statement-breakpoint
CREATE INDEX `sensors_measurement_type_idx` ON `sensors` (`measurement_type`);