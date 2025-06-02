import { api } from "#src/lib/api/api";
import { z } from "zod";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { HttpException } from "#src/lib/api/http";
import { ApiResponse } from "#src/types/api-response";
import { Currency } from "#src/prisma-gen/index";

//Initi data and currencies
const Schema = z.object({
  symbol: z.string({ message: "Currency symbol is required" }).toUpperCase()
});

export interface WithdrawalInitApiResponse extends ApiResponse {
  currency: Currency;
  user: {
    walletBalance: number;
  };
}

export default api(
  {
    group: "/users/me",
    path: "/transactions/withdrawal/initialize",
    method: "get",
    middleware: defineValidator("query", Schema)
  },
  defineHandler(async (req) => {
    const userId = req.user!.id;
    const { symbol } = req.validatedQuery as z.infer<typeof Schema>;

    const [currency, user] = await Promise.all([
      prisma.currency.findUnique({
        where: { abbr: symbol }
      }),

      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          account: {
            select: {
              walletBalance: true
            }
          }
        }
      })
    ]);

    if (!user) {
      throw HttpException.notFound("Account not found");
    }

    if (!currency) {
      throw HttpException.notFound("Currency not found");
    }

    //const updatedCurrency = await getUpdatedCurrencyData(currency);

    const payload: WithdrawalInitApiResponse = {
      success: true,
      message: "Successful",
      currency,
      user: {
        walletBalance: user.account?.walletBalance || 0
      }
    };

    return payload;
  })
);
