import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { InvestmentPlan } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";
import { JsonValue } from "@prisma/client/runtime/library";

export interface InvestmentPlanApiResponse extends ApiResponse {
  plan: InvestmentPlan;
}

export interface InvestmentPlansApiResponse extends ApiResponse {
  plans: InvestmentPlan[];
}

export default api(
  {
    group: "/users/me",
    path: "/investment-plans{/:investment_plan_id}",
    method: "get"
  },
  defineHandler(async (req) => {
    const investment_plan_id = req.params.investment_plan_id?.toString();

    const parsedQuery: ParsedQuery<InvestmentPlan> | undefined = req.parsedQuery;

    if (investment_plan_id) {
      const investmentPlan = await prisma.investmentPlan.findUnique({
        where: { id: investment_plan_id }
      });

      if (!investmentPlan) {
        throw HttpException.notFound("Not found");
      }

      const payload: InvestmentPlanApiResponse = {
        success: true,
        message: "Successful",
        plan: investmentPlan
      };

      return payload;
    }

    const investmentPlans = await prisma.investmentPlan.findMany();

    const payload: InvestmentPlansApiResponse = {
      success: true,
      message: "Successful",
      plans: investmentPlans
    };

    return payload;
  })
);
