
import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { InvestmentPlan } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";

export interface InvestmentPlansGetApiResponse extends ApiResponse {
  investmentPlans: InvestmentPlan[];
}

export interface InvestmentPlanGetApiResponse extends ApiResponse {
  investmentPlan: InvestmentPlan;
}

export default api(
  {
    group: "/admins/me",
    path: "/investment-plans{/:investment_plan_id}",
  },
  defineHandler(async (req) => {
    const { investment_plan_id } = req.params;

    const parsedQuery: ParsedQuery<InvestmentPlan> | undefined = req.parsedQuery;

    if (investment_plan_id) {
      const investmentPlan = await prisma.investmentPlan.findUnique({
        where: { id: investment_plan_id },
      });

      if (!investmentPlan) {
        throw HttpException.notFound("InvestmentPlan not found");
      }

      const payload: InvestmentPlanGetApiResponse = {
        success: true,
        message: "Successful",
        investmentPlan
      };

      return payload;
    }

    const investmentPlans = await prisma.investmentPlan.findMany({
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

    const payload: InvestmentPlansGetApiResponse = {
      success: true,
      message: "Successful",
      investmentPlans
    };

    return payload;
  })
)
