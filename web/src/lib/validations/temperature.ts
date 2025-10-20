import { z } from "zod";

export const TemperatureEntrySchema = z.object({
  label: z.string(),
  current: z.number(),
});

export const TemperatureInfoSchema = z.record(z.array(TemperatureEntrySchema));
