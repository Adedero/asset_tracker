import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { Profit, Transaction } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";
import { GET_REQUEST_DATA_LIMIT } from "#src/utils/constants";

export interface WalletApiResponse extends ApiResponse {
  walletBalance: number;
  profit: Profit | null;
  transactions: Transaction[];
}

export default api(
  {
    group: "/users/me",
    path: "/wallet",
    method: "get"
  },
  defineHandler(async (req) => {
    const userId = req.user!.id;

    const [account, latestProfit, recentTransactions] = await Promise.all([
      prisma.account.findUnique({
        where: { userId },
        select: { walletBalance: true }
      }),
      prisma.profit.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: GET_REQUEST_DATA_LIMIT
      })
    ]);

    if (!account) {
      await prisma.account.create({
        data: { userId, walletBalance: 0 }
      });
    }

    const payload: WalletApiResponse = {
      success: true,
      walletBalance: account?.walletBalance || 0,
      profit: latestProfit,
      transactions: recentTransactions
    };

    return payload;
  })
);
