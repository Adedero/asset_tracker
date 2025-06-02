import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { Currency } from "#src/prisma-gen";
import { ApiResponse } from "#src/types/api-response";
import { z } from "zod";

const Schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters long" }),
  symbol: z.string().trim(),
  abbr: z.string().trim().toUpperCase(),
  image: z.string().trim().optional(),
  rate: z
    .number()
    .gt(0, { message: "Rate must be greater than 0" })
    .positive({ message: "Rate must be positive" }),
  rateUpdatedAt: z.coerce.date().optional(),
  walletAddress: z.string({ message: "Wallet address is required" }).trim(),
  walletAddressNetwork: z.string().trim().optional(),
  isAvailableForWithdrawal: z.boolean().optional(),
  withdrawalCharge: z
    .number()
    .positive({ message: "Rate must be positive" })
    .optional(),
});

export interface CurrencyCreateApiResponse extends ApiResponse {
  currency: Currency;
}


export default api(
  {
    group: "/admins/me",
    path: "/currencies",
    method: "post",
    middleware: defineValidator("body", Schema)
  },
  defineHandler<CurrencyCreateApiResponse>(async (req) => {
    const data = req.validatedBody as z.infer<typeof Schema>;
    const currency = await prisma.currency.create({
      data
    });
    return {
      statusCode: 201,
      success: true,
      message: "Currency updated successfully",
      currency
    };
  })
);
