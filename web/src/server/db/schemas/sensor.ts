import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { devices } from "./device";

/**
 * Sensor Table
 * Tracks IoT sensors (temperature, air conditioner, TV, etc.)
 */
export const sensors = sqliteTable(
  "sensors",
  {
    id: text("id").primaryKey(), // Unique sensor ID
    userId: text("user_id").notNull(),
    deviceId: text("device_id").references(() => devices.id, {
      onDelete: "set null",
    }), // Optional association with a device
    name: text("name").notNull(),
    measurementType: text("measurement_type").notNull(), // tv, air_conditioner, temperature, humidity, motion, etc.
    location: text("location"), // Optional room/location description
    status: text("status").notNull().default("active"), // active, inactive, offline
    metadata: text("metadata", { mode: "json" }), // Additional sensor-specific data
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("sensors_user_id_idx").on(table.userId),
    deviceIdIdx: index("sensors_device_id_idx").on(table.deviceId),
    measurementTypeIdx: index("sensors_measurement_type_idx").on(
      table.measurementType,
    ),
  }),
);

/**
 * Sensor Data Table
 * Stores time-series data from sensors
 */
export const sensorData = sqliteTable(
  "sensor_data",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sensorId: text("sensor_id")
      .notNull()
      .references(() => sensors.id, { onDelete: "cascade" }),
    timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
    value: text("value").notNull(), // Generic value field (can be number, string, JSON)
    unit: text("unit"), // e.g., °C, %, on/off
    metadata: text("metadata", { mode: "json" }), // Additional reading metadata
    receivedAt: integer("received_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  },
  (table) => ({
    sensorIdIdx: index("sensor_data_sensor_id_idx").on(table.sensorId),
    timestampIdx: index("sensor_data_timestamp_idx").on(table.timestamp),
    sensorTimestampIdx: index("sensor_data_sensor_timestamp_idx").on(
      table.sensorId,
      table.timestamp,
    ),
  }),
);
