import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { Investment } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";

export interface InvestmentsGetApiResponse extends ApiResponse {
  investments: Investment[];
}

export interface InvestmentGetApiResponse extends ApiResponse {
  investment: Investment;
}

export default api(
  {
    group: "/users/me",
    path: "/investments{/:investment_id}",
    method: "get"
  },
  defineHandler(async (req) => {
    const userId = req.user!.id;
    const investment_id = req.params.investment_id?.toString();

    const parsedQuery: ParsedQuery<Investment> | undefined = req.parsedQuery;

    if (investment_id) {
      const investment = await prisma.investment.findUnique({
        where: { id: investment_id, userId }
      });

      if (!investment) {
        throw HttpException.notFound("Not found");
      }

      const payload: InvestmentGetApiResponse = {
        success: true,
        message: "Successful",
        investment
      };

      return payload;
    }

    const investments = await prisma.investment.findMany({
      where: { userId, ...(parsedQuery?.where || {}) },
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

    const payload: InvestmentsGetApiResponse = {
      success: true,
      message: "Successful",
      investments
    };

    return payload;
  })
);
