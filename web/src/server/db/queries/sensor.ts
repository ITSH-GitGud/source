import { db } from "..";
import { sensors, sensorData } from "../schemas/sensor";
import { eq, desc, and, gte, lte } from "drizzle-orm";

/**
 * Create a new sensor
 */
export async function createSensor(data: {
  id: string;
  userId: string;
  name: string;
  measurementType: string;
  deviceId?: string;
  location?: string;
}) {
  return await db
    .insert(sensors)
    .values({
      id: data.id,
      userId: data.userId,
      name: data.name,
      measurementType: data.measurementType,
      deviceId: data.deviceId,
      location: data.location,
      status: "active",
    })
    .returning();
}

/**
 * Get sensor by ID
 */
export async function getSensorById(sensorId: string) {
  return await db
    .select()
    .from(sensors)
    .where(eq(sensors.id, sensorId))
    .limit(1);
}

/**
 * Get all sensors for a user
 */
export async function getUserSensors(userId: string) {
  return await db
    .select()
    .from(sensors)
    .where(eq(sensors.userId, userId))
    .orderBy(desc(sensors.createdAt));
}

/**
 * Update sensor
 */
export async function updateSensor(
  sensorId: string,
  data: {
    name?: string;
    measurementType?: string;
    deviceId?: string | null;
    location?: string;
    status?: "active" | "inactive" | "offline";
  },
) {
  return await db
    .update(sensors)
    .set(data)
    .where(eq(sensors.id, sensorId))
    .returning();
}

/**
 * Delete sensor
 */
export async function deleteSensor(sensorId: string) {
  return await db.delete(sensors).where(eq(sensors.id, sensorId));
}

/**
 * Insert sensor data reading
 */
export async function insertSensorData(data: {
  sensorId: string;
  timestamp: Date;
  value: string;
  unit?: string;
  metadata?: object;
}) {
  return await db.insert(sensorData).values({
    sensorId: data.sensorId,
    timestamp: data.timestamp,
    value: data.value,
    unit: data.unit,
    metadata: data.metadata,
    receivedAt: new Date(),
  });
}

/**
 * Get latest sensor data
 */
export async function getLatestSensorData(sensorId: string, limit = 1) {
  return await db
    .select()
    .from(sensorData)
    .where(eq(sensorData.sensorId, sensorId))
    .orderBy(desc(sensorData.timestamp))
    .limit(limit);
}

/**
 * Get sensor data within a time range
 */
export async function getSensorDataRange(
  sensorId: string,
  startTime: Date,
  endTime: Date,
) {
  return await db
    .select()
    .from(sensorData)
    .where(
      and(
        eq(sensorData.sensorId, sensorId),
        gte(sensorData.timestamp, startTime),
        lte(sensorData.timestamp, endTime),
      ),
    )
    .orderBy(sensorData.timestamp);
}
