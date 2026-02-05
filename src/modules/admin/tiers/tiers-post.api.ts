import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { Currency, Tier } from "#src/prisma-gen";
import { TierSchema, tierSchema } from "#src/shared/schemas/tier.schema";
import { ApiResponse } from "#src/types/api-response";

export interface TierCreateApiResponse extends ApiResponse {
  tier: Tier;
}

export default api(
  {
    group: "/admins/me",
    path: "/tiers",
    method: "post",
    middleware: defineValidator("body", tierSchema)
  },
  defineHandler<TierCreateApiResponse>(async (req) => {
    const data = req.validatedBody as TierSchema;

    const existingTier = await prisma.tier.findUnique({
      where: { name: data.name }
    });

    if (existingTier) {
      throw HttpException.badRequest("A tier with this name already exists");
    }

    const tier = await prisma.tier.create({
      data
    });

    return {
      statusCode: 201,
      success: true,
      message: "Tier created successfully",
      tier
    };
  })
);
