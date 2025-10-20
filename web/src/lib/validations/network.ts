import { z } from "zod";

export const NetworkInfoSchema = z.object({
  bytes_sent: z.number(),
  bytes_received: z.number(),
  packets_sent: z.number(),
  packets_received: z.number(),
});
