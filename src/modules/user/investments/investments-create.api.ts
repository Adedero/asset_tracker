import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import {
  Investment,
  InvestmentStatus,
  TransactionStatus,
  TransactionType
} from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";
import { number, z } from "zod";
import Decimal from "decimal.js";
import { alertEmitter } from "#src/events/alert.event";

export interface InvestmentCreateApiResponse extends ApiResponse {
  investment: Investment;
}

const Schema = z.object({
  autocompounded: z.boolean(),
  investmentStatus: z
    .enum([InvestmentStatus.OPEN, InvestmentStatus.CLOSED, InvestmentStatus.TERMINATED])
    .optional(),
  initialDeposit: z.number(),
  expectedReturnRate: z.number(),
  autocompoundedReturnRate: number().optional(),
  expectedTotalReturns: z.number(),
  currentTotalReturns: z.number(),
  currentCompoundedAmount: z.number().optional(),
  investmentName: z.string(),
  investmentTier: z.string(),
  minimumDeposit: z.number(),
  duration: z.number(),
  terminationFee: z.number(),
  daysCompleted: z.number()
});

export default api(
  {
    group: "/users/me",
    path: "/investments",
    method: "post",
    middleware: defineValidator("body", Schema)
  },
  defineHandler(async (req) => {
    Decimal.set({ precision: 5, rounding: 2 });

    const userId = req.user!.id;
    const data = req.validatedBody as z.infer<typeof Schema>;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, account: { select: { walletBalance: true } } }
    });

    if (!user || !user.account) {
      throw HttpException.notFound("User not found.");
    }

    if (!user.account.walletBalance || user.account.walletBalance < data.initialDeposit) {
      throw HttpException.badRequest("Insufficient funds.");
    }

    const walletBalance = new Decimal(user.account.walletBalance);
    const initialDeposit = new Decimal(data.initialDeposit);

    const updatedWalletBalance = walletBalance.minus(initialDeposit).toNumber();

    const investment = await prisma.$transaction<Investment>(async (txn): Promise<Investment> => {
      const inv = await txn.investment.create({
        data: { ...data, userId }
      });

      await txn.transaction.create({
        data: {
          userId,
          investmentId: inv.id,
          transactionType: TransactionType.INVESTMENT,
          transactionStatus: TransactionStatus.SUCCESSFUL,
          amountInUSD: inv.initialDeposit,
          charge: 0,
          actualAmountInUSD: inv.initialDeposit,
          rate: 1,
          currency: "USD",
          amountInCurrency: inv.initialDeposit,
          isWireTransfer: false,
          approvedAt: new Date()
        }
      });

      await txn.account.update({
        where: { userId },
        data: { walletBalance: updatedWalletBalance }
      });

      return inv;
    });

    alertEmitter.emit("investment:create", { user: req.user!, investment });

    const payload: InvestmentCreateApiResponse = {
      success: true,
      investment
    };
    return payload;
  })
);
