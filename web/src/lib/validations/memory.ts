import { z } from "zod";

export const MemoryInfoSchema = z.object({
  total_gb: z.number(),
  available_gb: z.number(),
  used_gb: z.number(),
  percent: z.number(),
});
