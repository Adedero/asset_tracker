import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { AccountGroup, Currency } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";

export interface AccountGroupsPageApiResponse extends ApiResponse {
  accountGroups: AccountGroup[];
  currencies: Currency[];
}

export default api(
  {
    group: "/admins/me",
    path: "/pages/account-groups"
  },
  defineHandler(async (req) => {
    const parsedQuery: ParsedQuery<AccountGroup> | undefined = req.parsedQuery;

    const [accountGroups, currencies] = await Promise.all([
      prisma.accountGroup.findMany({
        //@ts-ignore
        where: { ...(parsedQuery?.where || {}) },
        orderBy: parsedQuery?.sort,
        take: parsedQuery?.take,
        skip: parsedQuery?.skip
      }),

      prisma.currency.findMany()
    ]);

    const payload: AccountGroupsPageApiResponse = {
      success: true,
      message: "Successful",
      accountGroups,
      currencies
    };

    return payload;
  })
);
