import { z } from "zod";
import { SystemInfoSchema } from "./system";
import { CPUInfoSchema } from "./cpu";
import { MemoryInfoSchema } from "./memory";
import { DiskInfoSchema } from "./disk";
import { BatteryInfoSchema } from "./battery";
import { PowerInfoSchema } from "./power";
import { NetworkInfoSchema } from "./network";
import { TemperatureInfoSchema } from "./temperature";

export const LaptopDataSchema = z.object({
  timestamp: z.string(),
  system_info: SystemInfoSchema,
  cpu_info: CPUInfoSchema,
  memory_info: MemoryInfoSchema,
  disk_info: z.array(DiskInfoSchema),
  battery_info: BatteryInfoSchema.nullable(),
  power_info: PowerInfoSchema.nullable(),
  network_info: NetworkInfoSchema,
  temperature_info: TemperatureInfoSchema.nullable(),
});

export type LaptopData = z.infer<typeof LaptopDataSchema>;
