import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { InvestmentPlan } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";

export interface InvestmentInitApiResponse extends ApiResponse {
  plan: InvestmentPlan;
  walletBalance: number;
}
export default api(
  {
    group: "/users/me",
    path: "investments/initialize/:investment_plan_slug",
    method: "get"
  },
  defineHandler(async (req) => {
    const userId = req.user!.id;
    const { investment_plan_slug } = req.params;

    const [plan, account] = await Promise.all([
      prisma.investmentPlan.findUnique({
        where: { slug: investment_plan_slug }
      }),
      prisma.account.findUnique({
        where: { userId },
        select: { walletBalance: true }
      })
    ]);

    if (!plan) {
      throw HttpException.notFound("Investment plan not found.");
    }

    const payload: InvestmentInitApiResponse = {
      success: true,
      message: "Successful",
      plan,
      walletBalance: account?.walletBalance || 0
    };

    return payload;
  })
);
