
import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { InvestmentPlan } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";
import { HttpException } from "#src/lib/api/http";

export interface InvestmentPlanDeleteApiResponse extends ApiResponse {
  investmentPlan: InvestmentPlan;
}

export default api(
  {
    group: "/admins/me",
    path: "/investment-plans{/:investment_plan_id}",
    method: "delete"
  },
  defineHandler(async (req) => {
    const { investment_plan_id } = req.params;

    const investmentPlan = await prisma.investmentPlan.delete({
      where: { id: investment_plan_id },
    });

    if (!investmentPlan) {
      throw HttpException.notFound("InvestmentPlan not found");
    }

    const payload: InvestmentPlanDeleteApiResponse = {
      success: true,
      message: "Investment plan deleted successfully",
      investmentPlan
    };

    return payload;
  })
)
