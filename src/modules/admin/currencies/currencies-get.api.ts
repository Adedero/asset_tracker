import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { Currency } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";

export interface CurrenciesGetApiResponse extends ApiResponse {
  currencies: Currency[];
}

export interface CurrencyGetApiResponse extends ApiResponse {
  currency: Currency;
}
export default api(
  {
    group: "/admins/me",
    path: "/currencies{/:currency_id}"
  },
  defineHandler(async (req) => {
    const { currency_id } = req.params;

    const parsedQuery: ParsedQuery<Currency> | undefined = req.parsedQuery;

    if (currency_id) {
      const currency = await prisma.currency.findUnique({
        where: { id: currency_id }
      });

      if (!currency) {
        throw HttpException.notFound("Currency not found");
      }

      const payload: CurrencyGetApiResponse = {
        success: true,
        message: "Successful",
        currency
      };

      return payload;
    }

    const currencies = await prisma.currency.findMany({
      //@ts-ignore
      where: { ...(parsedQuery?.where || {}) },
      /*  //@ts-ignore
      select: {
        ...(parsedQuery?.select || {}),
        ...(parsedQuery?.populate || {}),
        ...(parsedQuery?.exclude || {})
      }, */
      orderBy: parsedQuery?.sort,
      take: parsedQuery?.take,
      skip: parsedQuery?.skip
    });

    const payload: CurrenciesGetApiResponse = {
      success: true,
      message: "Successful",
      currencies
    };

    return payload;
  })
);
