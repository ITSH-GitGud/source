import { z } from "zod";

export const SystemInfoSchema = z.object({
  system: z.string(),
  node_name: z.string(),
  release: z.string(),
  version: z.string(),
  machine: z.string(),
  processor: z.string(),
});
