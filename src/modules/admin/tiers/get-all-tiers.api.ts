import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { Tier } from "#src/prisma-gen";

export type GetAllTiersApi = {
  success: boolean;
  message: string;
  tiers: Tier[];
};

export default api(
  {
    method: "get",
    group: "/admins/me",
    path: "/tiers"
  },
  defineHandler<GetAllTiersApi>(async (req) => {
    const parsedQuery: ParsedQuery<Tier> | undefined = req.parsedQuery;

    const tiers = await prisma.tier.findMany({
      take: parsedQuery?.take,
      skip: parsedQuery?.skip,
      orderBy: parsedQuery?.sort
    });

    return {
      success: true,
      message: "Tiers fetched successfully",
      tiers
    };
  })
);
