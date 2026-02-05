import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { Currency, Tier } from "#src/prisma-gen";
import { TierSchema, tierSchema } from "#src/shared/schemas/tier.schema";
import { ApiResponse } from "#src/types/api-response";

export interface TierUpdateApiResponse extends ApiResponse {
  tier: Tier;
}

export default api(
  {
    group: "/admins/me",
    path: "/tiers/:tier_id",
    method: "put",
    middleware: defineValidator("body", tierSchema)
  },
  defineHandler<TierUpdateApiResponse>(async (req) => {
    const tierId = req.params.tier_id;
    const data = req.validatedBody as TierSchema;

    const existingTier = await prisma.tier.findUnique({
      where: { name: data.name, NOT: { id: tierId } }
    });

    if (existingTier) {
      throw HttpException.badRequest("A tier with this name already exists");
    }

    const tier = await prisma.tier.update({
      where: { id: tierId },
      data
    });

    return {
      statusCode: 200,
      success: true,
      message: "Tier updated successfully",
      tier
    };
  })
);
