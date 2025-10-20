import { z } from "zod";
import { LaptopDataSchema } from "./laptop";

export const DeviceDataRequestSchema = z.object({
  deviceId: z.string().min(1, "Device ID is required"),
  timestamp: z.string(),
  hostname: z.string(),
  data: LaptopDataSchema,
});
