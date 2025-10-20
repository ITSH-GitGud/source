import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

/**
 * Device Registry Table
 * Tracks all registered devices (laptops/desktops)
 */
export const devices = sqliteTable(
  "devices",
  {
    id: text("id").primaryKey(), // Unique device ID (hostname_mac)
    userId: text("user_id"),
    hostname: text("hostname").notNull(),
    systemInfo: text("system_info", { mode: "json" }), // Stores system details as JSON
    firstSeen: integer("first_seen", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    lastSeen: integer("last_seen", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    status: text("status").notNull().default("active"), // active, inactive, offline
    notes: text("notes"),
  },
  (table) => ({
    userIdIdx: index("devices_user_id_idx").on(table.userId),
    lastSeenIdx: index("devices_last_seen_idx").on(table.lastSeen),
    statusIdx: index("devices_status_idx").on(table.status),
  }),
);

/**
 * Device Data Table
 * Stores telemetry data from devices (time-series data)
 */
export const deviceData = sqliteTable(
  "device_data",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    deviceId: text("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
    receivedAt: integer("received_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),

    // CPU Data
    cpuUsage: integer("cpu_usage").notNull(), // Overall CPU percentage
    cpuFreqCurrent: integer("cpu_freq_current"), // MHz
    cpuCores: integer("cpu_cores"),
    cpuPerCoreUsage: text("cpu_per_core_usage", { mode: "json" }), // Array of per-core usage

    // Memory Data
    memoryTotal: integer("memory_total").notNull(), // GB
    memoryUsed: integer("memory_used").notNull(), // GB
    memoryAvailable: integer("memory_available").notNull(), // GB
    memoryPercent: integer("memory_percent").notNull(),

    // Battery Data
    batteryPercent: integer("battery_percent"),
    batteryPluggedIn: integer("battery_plugged_in", { mode: "boolean" }),
    batteryTimeLeft: integer("battery_time_left"), // seconds
    batteryStatus: integer("battery_status"), // 1=discharging, 2=AC, 3=fully charged, 4=low, 5=critical

    // Power Data (Charging/Voltage)
    powerVoltage: integer("power_voltage"), // mV
    powerCurrentRate: integer("power_current_rate"), // mW (negative = discharging, positive = charging)
    powerRemainingCapacity: integer("power_remaining_capacity"), // mWh
    powerFullChargeCapacity: integer("power_full_charge_capacity"), // mWh
    powerDesignCapacity: integer("power_design_capacity"), // mWh

    // Disk Data
    diskInfo: text("disk_info", { mode: "json" }), // Array of disk partitions with usage

    // Network Data
    networkBytesSent: integer("network_bytes_sent"),
    networkBytesReceived: integer("network_bytes_received"),
    networkPacketsSent: integer("network_packets_sent"),
    networkPacketsReceived: integer("network_packets_received"),

    // Temperature Data
    temperatureInfo: text("temperature_info", { mode: "json" }), // JSON object with temp sensors

    // Full data snapshot (for detailed analysis)
    fullDataSnapshot: text("full_data_snapshot", { mode: "json" }), // Complete data payload
  },
  (table) => ({
    deviceIdIdx: index("device_data_device_id_idx").on(table.deviceId),
    timestampIdx: index("device_data_timestamp_idx").on(table.timestamp),
    deviceTimestampIdx: index("device_data_device_timestamp_idx").on(
      table.deviceId,
      table.timestamp,
    ),
  }),
);

/**
 * Device Alerts Table
 * Tracks alerts/warnings for devices (low battery, high CPU, etc.)
 */
export const deviceAlerts = sqliteTable(
  "device_alerts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    deviceId: text("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    alertType: text("alert_type").notNull(), // battery_low, cpu_high, memory_high, disk_full, etc.
    severity: text("severity").notNull(), // info, warning, critical
    message: text("message").notNull(),
    value: integer("value"), // The metric value that triggered the alert
    threshold: integer("threshold"), // The threshold that was exceeded
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    resolvedAt: integer("resolved_at", { mode: "timestamp" }),
    acknowledged: integer("acknowledged", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (table) => ({
    deviceIdIdx: index("device_alerts_device_id_idx").on(table.deviceId),
    createdAtIdx: index("device_alerts_created_at_idx").on(table.createdAt),
    severityIdx: index("device_alerts_severity_idx").on(table.severity),
  }),
);

/**
 * Device Commands Table
 * Commands sent to devices (shutdown, restart, update settings, etc.)
 */
export const deviceCommands = sqliteTable(
  "device_commands",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    deviceId: text("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    commandType: text("command_type").notNull(), // shutdown, restart, stop, update_interval, etc.
    payload: text("payload", { mode: "json" }), // Additional command data
    status: text("status").notNull().default("pending"), // pending, acknowledged, executed, failed
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    acknowledgedAt: integer("acknowledged_at", { mode: "timestamp" }),
    executedAt: integer("executed_at", { mode: "timestamp" }),
    error: text("error"),
  },
  (table) => ({
    deviceIdIdx: index("device_commands_device_id_idx").on(table.deviceId),
    statusIdx: index("device_commands_status_idx").on(table.status),
    createdAtIdx: index("device_commands_created_at_idx").on(table.createdAt),
  }),
);
