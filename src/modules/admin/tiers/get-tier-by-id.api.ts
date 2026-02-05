import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";

export default api(
  {
    method: "get",
    group: "/admins/me",
    path: "/tiers/:tier_id"
  },
  defineHandler(async (req) => {
    const tierId = req.params.tier_id;
    const tier = await prisma.tier.findUnique({
      where: { id: tierId }
    });

    if (!tier) {
      throw HttpException.notFound("Tier not found");
    }

    return {
      success: true,
      message: "Tier fetched successfully",
      tier
    };
  })
);
