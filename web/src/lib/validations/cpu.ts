import { z } from "zod";

export const CPUInfoSchema = z.object({
  physical_cores: z.number(),
  total_cores: z.number(),
  cpu_usage_percent: z.number(),
  cpu_freq_current: z.number().nullable(),
  cpu_freq_max: z.number().nullable(),
  per_cpu_usage: z.array(z.number()),
});
