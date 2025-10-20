import { z } from "zod";

export const PowerInfoSchema = z.object({
  full_charge_capacity_mwh: z.number().optional(),
  design_capacity_mwh: z.number().optional(),
  default_alert: z.number().optional(),
  current_rate_mw: z.number().optional(),
  current_rate_w: z.number().optional(),
  voltage_mv: z.number().optional(),
  voltage_v: z.number().optional(),
  remaining_capacity_mwh: z.number().optional(),
  error: z.string().optional(),
});
