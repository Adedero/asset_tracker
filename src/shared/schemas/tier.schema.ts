import { z } from "zod";

export const tierSchema = z.object({
  name: z.coerce
    .string()
    .nonempty("Tier name is required")
    .min(3, "Tier name is too short")
    .max(100, "Tier name is too long"),
  description: z.coerce.string().max(255, "Description is too long").nullish()
});

export type TierSchema = z.infer<typeof tierSchema>;
