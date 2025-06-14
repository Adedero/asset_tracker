import { alertEmitter } from "#src/events/alert.event";
import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { Transaction, User } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";
import Decimal from "decimal.js";
import { z } from "zod";

export interface TransactionApprovalApiResponse extends ApiResponse {
  transaction: TransactionWithUser;
}

type TransactionWithUser = Transaction & {
  user: User;
};

const Schema = z
  .object({
    amountInUSD: z
      .number({ message: "Transaction amount must be a number" })
      .min(0, { message: "Transaction amount must be a positive number" })
      .optional(),

    cards: z
      .array(
        z.object({
          type: z.string({ message: "Gift card type is required" }),
          country: z.string({ message: "Gift card country is required" }),
          cardNumber: z.string({ message: "Gift card number is required" }),
          pin: z.string({ message: "Gift card pin is required" }),
          amount: z
            .number({ message: "Gift card amount is required" })
            .min(0, { message: "Gift card amount must be greater than 0" }),
          currency: z.enum(["USD", "CAD", "GBP"]),
          amountRetrieved: z
            .number({ message: "Amount retrieved must be a number" })
            .min(0, { message: "Amount retrieved must be greater than 0" }),
          rateUsed: z.number({ message: "Rate used must be a number" }).optional()
        })
      )
      .optional()
  })
  .optional();

export default api(
  {
    group: "/admins/me",
    path: "/transactions/:transaction_id/approve",
    method: "put",
    middleware: defineValidator("body", Schema)
  },
  defineHandler<TransactionApprovalApiResponse>(async (req) => {
    const { transaction_id } = req.params;
    const data = req.validatedBody as z.infer<typeof Schema>;

    const update = data?.amountInUSD
      ? {
          amountInUSD: data.amountInUSD,
          actualAmountInUSD: data.amountInUSD,
          amountInCurrency: data.amountInUSD
        }
      : undefined;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transaction_id }
    });

    if (!transaction) throw HttpException.notFound("Transaction not found");

    let giftCardData = transaction.giftCardData || undefined;
    if (giftCardData) {
      giftCardData = {
        ...giftCardData,
        cards: [...(data?.cards || giftCardData.cards)]
      };
    }

    const promises: any[] = [];

    promises.push(
      prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          ...update,
          giftCardData,
          transactionStatus: "SUCCESSFUL",
          approvedAt: new Date()
        },
        include: { user: true }
      })
    );

    if (transaction.transactionType === "DEPOSIT") {
      const account = await prisma.account.findUnique({
        where: { userId: transaction.userId }
      });

      if (!account) throw HttpException.notFound("User's account not found");

      const walletBalance = new Decimal(account.walletBalance);
      const amountInUSD = new Decimal(transaction.amountInUSD);
      promises.push(
        prisma.account.update({
          where: { id: account.id },
          data: {
            walletBalance: walletBalance.plus(amountInUSD).toDecimalPlaces(2).toNumber()
          }
        })
      );
    }

    const [updatedTransaction] = (await prisma.$transaction(promises)) as Awaited<
      [TransactionWithUser]
    >;

    alertEmitter.emit("transaction:status-update", {
      transaction: updatedTransaction,
      user: updatedTransaction.user
    });

    return {
      success: true,
      message: "Transaction marked as approved",
      transaction: updatedTransaction
    };
  })
);
