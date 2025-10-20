import { z } from "zod";

export const DeviceCommandSchema = z.object({
  id: z.string(),
  type: z.enum(["shutdown", "restart", "stop", "update_interval"]),
  value: z.number().optional(),
  created_at: z.string().optional(),
});

export const CommandResponseSchema = z.object({
  commands: z.array(DeviceCommandSchema),
});

export const CommandAcknowledgementSchema = z.object({
  status: z.enum(["executed", "failed"]),
  timestamp: z.string(),
  error: z.string().optional(),
});
