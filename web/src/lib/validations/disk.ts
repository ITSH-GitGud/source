import { z } from "zod";

export const DiskInfoSchema = z.object({
  device: z.string(),
  mountpoint: z.string(),
  fstype: z.string(),
  total_gb: z.number(),
  used_gb: z.number(),
  free_gb: z.number(),
  percent: z.number(),
});
