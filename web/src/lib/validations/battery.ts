import { z } from "zod";

export const BatteryInfoSchema = z.object({
  percent: z.number(),
  plugged_in: z.boolean(),
  time_left_seconds: z.number().nullable(),
  battery_status: z.number().optional(),
  estimated_run_time: z.number().nullable().optional(),
});
