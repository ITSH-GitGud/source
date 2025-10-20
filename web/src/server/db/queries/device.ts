import { db } from "..";
import {
  devices,
  deviceData,
  deviceAlerts,
  deviceCommands,
} from "../schemas/device";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

/**
 * Register or update a device
 */
export async function upsertDevice(data: {
  id: string;
  hostname: string;
  systemInfo: object;
  userId?: string;
}) {
  const existing = await db
    .select()
    .from(devices)
    .where(eq(devices.id, data.id))
    .limit(1);

  // ...existing code...
  if (existing.length > 0) {
    // Update existing device, always set userId if provided
    return await db
      .update(devices)
      .set({
        hostname: data.hostname,
        systemInfo: data.systemInfo,
        lastSeen: new Date(),
        status: "active",
        ...(data.userId && { userId: data.userId }),
      })
      .where(eq(devices.id, data.id))
      .returning();
  }
  // ...existing code... else {
  // Insert new device
  return await db
    .insert(devices)
    .values({
      id: data.id,
      hostname: data.hostname,
      systemInfo: data.systemInfo,
      userId: data.userId,
      firstSeen: new Date(),
      lastSeen: new Date(),
      status: "active",
    })
    .returning();
}

/**
 * Insert device telemetry data
 */
export async function insertDeviceData(data: {
  deviceId: string;
  timestamp: Date;
  cpuUsage: number;
  cpuFreqCurrent?: number;
  cpuCores?: number;
  cpuPerCoreUsage?: number[];
  memoryTotal: number;
  memoryUsed: number;
  memoryAvailable: number;
  memoryPercent: number;
  batteryPercent?: number;
  batteryPluggedIn?: boolean;
  batteryTimeLeft?: number;
  batteryStatus?: number;
  powerVoltage?: number;
  powerCurrentRate?: number;
  powerRemainingCapacity?: number;
  powerFullChargeCapacity?: number;
  powerDesignCapacity?: number;
  diskInfo?: object;
  networkBytesSent?: number;
  networkBytesReceived?: number;
  networkPacketsSent?: number;
  networkPacketsReceived?: number;
  temperatureInfo?: object;
  fullDataSnapshot: object;
}) {
  return await db.insert(deviceData).values({
    deviceId: data.deviceId,
    timestamp: data.timestamp,
    receivedAt: new Date(),
    cpuUsage: data.cpuUsage,
    cpuFreqCurrent: data.cpuFreqCurrent,
    cpuCores: data.cpuCores,
    cpuPerCoreUsage: data.cpuPerCoreUsage,
    memoryTotal: data.memoryTotal,
    memoryUsed: data.memoryUsed,
    memoryAvailable: data.memoryAvailable,
    memoryPercent: data.memoryPercent,
    batteryPercent: data.batteryPercent,
    batteryPluggedIn: data.batteryPluggedIn,
    batteryTimeLeft: data.batteryTimeLeft,
    batteryStatus: data.batteryStatus,
    powerVoltage: data.powerVoltage,
    powerCurrentRate: data.powerCurrentRate,
    powerRemainingCapacity: data.powerRemainingCapacity,
    powerFullChargeCapacity: data.powerFullChargeCapacity,
    powerDesignCapacity: data.powerDesignCapacity,
    diskInfo: data.diskInfo,
    networkBytesSent: data.networkBytesSent,
    networkBytesReceived: data.networkBytesReceived,
    networkPacketsSent: data.networkPacketsSent,
    networkPacketsReceived: data.networkPacketsReceived,
    temperatureInfo: data.temperatureInfo,
    fullDataSnapshot: data.fullDataSnapshot,
  });
}

/**
 * Get device by ID
 */
export async function getDevice(deviceId: string) {
  return await db
    .select()
    .from(devices)
    .where(eq(devices.id, deviceId))
    .limit(1);
}

/**
 * Get all devices for a user
 */
export async function getUserDevices(userId: string) {
  return await db
    .select()
    .from(devices)
    .where(eq(devices.userId, userId))
    .orderBy(desc(devices.lastSeen));
}

/**
 * Get all devices (for admin/monitoring)
 */
export async function getAllDevices() {
  return await db.select().from(devices).orderBy(desc(devices.lastSeen));
}

/**
 * Get latest data for a device
 */
export async function getLatestDeviceData(deviceId: string, limit = 1) {
  return await db
    .select()
    .from(deviceData)
    .where(eq(deviceData.deviceId, deviceId))
    .orderBy(desc(deviceData.timestamp))
    .limit(limit);
}

/**
 * Get device data within a time range
 */
export async function getDeviceDataRange(
  deviceId: string,
  startTime: Date,
  endTime: Date,
) {
  return await db
    .select()
    .from(deviceData)
    .where(
      and(
        eq(deviceData.deviceId, deviceId),
        gte(deviceData.timestamp, startTime),
        lte(deviceData.timestamp, endTime),
      ),
    )
    .orderBy(deviceData.timestamp);
}

/**
 * Get device statistics (aggregated data)
 */
export async function getDeviceStats(deviceId: string, hours = 24) {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  const stats = await db
    .select({
      avgCpuUsage: sql<number>`AVG(${deviceData.cpuUsage})`,
      maxCpuUsage: sql<number>`MAX(${deviceData.cpuUsage})`,
      avgMemoryPercent: sql<number>`AVG(${deviceData.memoryPercent})`,
      maxMemoryPercent: sql<number>`MAX(${deviceData.memoryPercent})`,
      avgBatteryPercent: sql<number>`AVG(${deviceData.batteryPercent})`,
      minBatteryPercent: sql<number>`MIN(${deviceData.batteryPercent})`,
      dataPoints: sql<number>`COUNT(*)`,
    })
    .from(deviceData)
    .where(
      and(
        eq(deviceData.deviceId, deviceId),
        gte(deviceData.timestamp, startTime),
      ),
    );

  return stats[0];
}

/**
 * Create a device alert
 */
export async function createDeviceAlert(data: {
  deviceId: string;
  alertType: string;
  severity: "info" | "warning" | "critical";
  message: string;
  value?: number;
  threshold?: number;
}) {
  return await db.insert(deviceAlerts).values({
    deviceId: data.deviceId,
    alertType: data.alertType,
    severity: data.severity,
    message: data.message,
    value: data.value,
    threshold: data.threshold,
    createdAt: new Date(),
  });
}

/**
 * Get active alerts for a device
 */
export async function getDeviceAlerts(
  deviceId: string,
  includeResolved = false,
) {
  const conditions = includeResolved
    ? eq(deviceAlerts.deviceId, deviceId)
    : and(
        eq(deviceAlerts.deviceId, deviceId),
        sql`${deviceAlerts.resolvedAt} IS NULL`,
      );

  return await db
    .select()
    .from(deviceAlerts)
    .where(conditions)
    .orderBy(desc(deviceAlerts.createdAt));
}

/**
 * Create a device command
 */
export async function createDeviceCommand(data: {
  deviceId: string;
  commandType: string;
  payload?: object;
}) {
  return await db
    .insert(deviceCommands)
    .values({
      deviceId: data.deviceId,
      commandType: data.commandType,
      payload: data.payload,
      status: "pending",
      createdAt: new Date(),
    })
    .returning();
}

/**
 * Get pending commands for a device
 */
export async function getPendingCommands(deviceId: string) {
  return await db
    .select()
    .from(deviceCommands)
    .where(
      and(
        eq(deviceCommands.deviceId, deviceId),
        eq(deviceCommands.status, "pending"),
      ),
    )
    .orderBy(deviceCommands.createdAt);
}

/**
 * Acknowledge a command
 */
export async function acknowledgeCommand(commandId: number) {
  return await db
    .update(deviceCommands)
    .set({
      status: "acknowledged",
      acknowledgedAt: new Date(),
    })
    .where(eq(deviceCommands.id, commandId));
}

/**
 * Mark command as executed
 */
export async function markCommandExecuted(commandId: number, error?: string) {
  return await db
    .update(deviceCommands)
    .set({
      status: error ? "failed" : "executed",
      executedAt: new Date(),
      error,
    })
    .where(eq(deviceCommands.id, commandId));
}

/**
 * Delete old device data (data retention/cleanup)
 */
export async function deleteOldDeviceData(daysToKeep = 30) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

  return await db
    .delete(deviceData)
    .where(lte(deviceData.timestamp, cutoffDate));
}

/**
 * Mark device as offline if no data received recently
 */
export async function markStaleDevicesOffline(minutesThreshold = 15) {
  const cutoffTime = new Date(Date.now() - minutesThreshold * 60 * 1000);

  return await db
    .update(devices)
    .set({ status: "offline" })
    .where(
      and(lte(devices.lastSeen, cutoffTime), eq(devices.status, "active")),
    );
}
