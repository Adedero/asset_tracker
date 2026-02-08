import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { Account, User, UserTier } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";

type AccountWithUserAndTier = Account & {
  user: User;
  tier: UserTier | null;
};

export interface AccountsGetApiResponse extends ApiResponse {
  accounts: AccountWithUserAndTier[];
}

export interface AccountGetApiResponse extends ApiResponse {
  account: AccountWithUserAndTier;
}

export default api(
  {
    group: "/admins/me",
    path: "/accounts{/:account_id}"
  },
  defineHandler(async (req) => {
    const { account_id } = req.params;

    const parsedQuery: ParsedQuery<Account> | undefined = req.parsedQuery;

    if (account_id) {
      const account = await prisma.account.findUnique({
        where: { id: account_id },
        include: { user: true, tier: true }
      });

      if (!account) {
        throw HttpException.notFound("Account not found");
      }

      const payload: AccountGetApiResponse = {
        success: true,
        message: "Successful",
        account
      };

      return payload;
    }

    const accounts = await prisma.account.findMany({
      //@ts-ignore
      where: { ...(parsedQuery?.where || {}) },
      include: { user: true, tier: true },
      orderBy: parsedQuery?.sort,
      take: parsedQuery?.take,
      skip: parsedQuery?.skip
    });

    const payload: AccountsGetApiResponse = {
      success: true,
      message: "Successful",
      accounts
    };

    return payload;
  })
);
