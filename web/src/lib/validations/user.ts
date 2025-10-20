import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal("").transform(() => undefined))
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
