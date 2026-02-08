import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { UserTier } from "#src/prisma-gen";

export type DeleteTierByIdApi = {
  success: boolean;
  message: string;
  tier: UserTier;
};

export default api(
  {
    group: "/admins/me",
    path: "/tiers/:tier_id",
    method: "delete"
  },
  defineHandler<DeleteTierByIdApi>(async (req) => {
    const { tier_id } = req.params;
    const tier = await prisma.userTier.delete({
      where: { id: tier_id }
    });
    return {
      success: true,
      message: "Tier deleted successfully",
      tier
    };
  })
);
