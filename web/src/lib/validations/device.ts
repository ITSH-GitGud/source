import { z } from "zod";

export const deviceRegisterSchema = z.object({
  hostname: z
    .string()
    .min(1, "Hostname is required")
    .min(2, "Hostname must be at least 2 characters")
    .max(255, "Hostname is too long"),
  deviceId: z
    .string()
    .min(1, "Device ID is required")
    .regex(
      /^[a-zA-Z0-9_:-]+$/,
      "Device ID can only contain letters, numbers, hyphens, underscores, and colons",
    ),
  notes: z.string().max(500, "Notes are too long").optional(),
  systemInfo: z
    .object({
      os: z.string().optional(),
      osVersion: z.string().optional(),
      processor: z.string().optional(),
      totalMemory: z.number().optional(),
      architecture: z.string().optional(),
    })
    .optional(),
});

export type DeviceRegisterInput = z.infer<typeof deviceRegisterSchema>;
