import { z } from "zod";
import { id } from "zod/v4/locales";

export const measurementTypes = [
  "tv",
  "air_conditioner",
  "temperature",
  "humidity",
  "motion",
  "light",
  "door",
  "window",
  "smoke",
  "camera",
  "thermostat",
  "fan",
  "heater",
  "other",
] as const;

export const registerSensorSchema = z.object({
  id: z.string().min(1, "Sensor ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  measurementType: z.enum(measurementTypes, {
    errorMap: () => ({ message: "Please select a valid measurement type" }),
  }),
  deviceId: z.string().optional(),
  location: z.string().optional(),
});

export const updateSensorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  measurementType: z.enum(measurementTypes).optional(),
  deviceId: z.string().nullable().optional(),
  location: z.string().optional(),
  status: z.enum(["active", "inactive", "offline"]).optional(),
});

export type RegisterSensorInput = z.infer<typeof registerSensorSchema>;
export type UpdateSensorInput = z.infer<typeof updateSensorSchema>;

// Ingest (hardware) specific schemas — unauthenticated endpoints
export const iotRegisterSensorSchema = registerSensorSchema.extend({
    id: z.string().min(1, "Sensor ID is required"),
    volts: z.number().optional(),
});

// Accepts flexible value types from hardware. We'll persist as string.
export const sensorReadingSchema = z.object({
  // epoch seconds or milliseconds, or ISO string; defaults to now if omitted
  timestamp: z.union([z.number(), z.string()]).optional(),
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.any())]),
  unit: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type IotRegisterSensorInput = z.infer<typeof iotRegisterSensorSchema>;
export type SensorReadingInput = z.infer<typeof sensorReadingSchema>;
