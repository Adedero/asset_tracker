import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { z } from "zod";

const Schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters long" })
    .optional(),
  symbol: z.string().trim().optional(),
  abbr: z.string().trim().toUpperCase().optional(),
  image: z.string().trim().optional(),
  rate: z.number().positive({ message: "Rate must be positive" }).optional(),
  rateUpdatedAt: z.coerce.date().optional(),
  walletAddress: z.string().trim().optional(),
  walletAddressNetwork: z.string().trim().optional(),
  isAvailableForWithdrawal: z.boolean().optional(),
  withdrawalCharge: z.number().positive({ message: "Rate must be positive" }).optional(),
});

export default api(
  {
    group: "/admins/me",
    path: "/currencies/:currency_id",
    method: "put",
    middleware: defineValidator("body", Schema)
  },
  defineHandler(async (req) => {
    const data = req.validatedBody as z.infer<typeof Schema>;
    const { currency_id } = req.params;
    const currency = await prisma.currency.update({
      where: { id: currency_id },
      data
    });
    return {
      success: true,
      message: "Currency updated successfully",
      currency
    };
  })
);
