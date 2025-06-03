import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { InvestmentPlan } from "#src/prisma-gen";
import { ApiResponse } from "#src/types/api-response";
import { z } from "zod";

const Schema = z.object({
  name: z.string({ message: "Name is required" }),
  slug: z.string({ message: "Slug is required" }),
  image: z.string({ message: "Image is required" }),
  tiers: z.array(
    z.object({
      name: z.string({ message: "Tier name is required" }),
      minimumDeposit: z
        .number({ message: "Minimum deposit must be a number" })
        .gt(0, { message: "Minimum deposit must be greater than 0" }),
      duration: z
        .number({ message: "Duration must be a number" })
        .int({ message: "Duration must be an integer" })
        .gt(0, { message: "Duration must be greater than 0" }),
      expectedReturnRate: z
        .number({ message: "Expected return rate must be a number" })
        .gt(0, { message: "Expected return rate must be greater than 0" }),
      terminationFee: z
        .number({ message: "Termination fee must be a number" })
        .min(0, { message: "Termination fee must be 0 or greater" })
    }),
    { message: "Investment tiers must be an array" }
  )
});

export interface InvestmentPlanCreateApiResponse extends ApiResponse {
  investmentPlan: InvestmentPlan;
}

export default api(
  {
    group: "/admins/me",
    path: "/investment-plans",
    method: "post",
    middleware: defineValidator("body", Schema)
  },
  defineHandler<InvestmentPlanCreateApiResponse>(async (req) => {
    const data = req.validatedBody as z.infer<typeof Schema>;

    const existingInvestmentPlan = await prisma.investmentPlan.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }]
      }
    });

    if (existingInvestmentPlan) {
      throw HttpException.badRequest("And investment plan with this name or slug already exists");
    }

    const investmentPlan = await prisma.investmentPlan.create({
      data
    });
    return {
      statusCode: 201,
      success: true,
      message: "Investment plan created successfully",
      investmentPlan
    };
  })
);
