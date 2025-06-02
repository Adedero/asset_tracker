import { alertEmitter } from "#src/events/alert.event";
import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { Transaction, TransactionStatus, TransactionType } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";
import { DUPLICATE_TRANSACTION_CHECK_TIME } from "#src/utils/constants";
import { z } from "zod";

const Schema = z.object({
  transactionType: z.enum([
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAWAL,
    TransactionType.INVESTMENT,
    TransactionType.PROFIT
  ]),
  transactionStatus: z.enum([
    TransactionStatus.FAILED,
    TransactionStatus.PENDING,
    TransactionStatus.SUCCESSFUL
  ]),
  amountInUSD: z.number(),
  charge: z.number(),
  actualAmountInUSD: z.number(),
  rate: z.number(),
  currency: z.string(),
  amountInCurrency: z.number(),
  isWireTransfer: z.boolean(),
  isGiftCard: z.boolean().optional(),
  giftCardData: z
    .object({
      rates: z.object({
        USD: z.number(),
        CAD: z.number().optional(),
        GBP: z.number().optional()
      }),
      totalInUSD: z.number().positive(),
      cards: z.array(
        z.object({
          type: z.string(),
          country: z.string(),
          cardNumber: z.string(),
          pin: z.string(),
          amount: z.number().positive(),
          currency: z.enum(["USD", "CAD", "GBP"])
        })
      )
    })
    .optional(),
  depositWalletAddress: z.string().optional(),
  depositWalletAddressNetwork: z.string().optional(),
  description: z.string().optional()
});

export interface DepositCeateApiResponse extends ApiResponse {
  transaction: Transaction;
}

export default api(
  {
    group: "/users/me",
    path: "/transactions/deposit",
    method: "post",
    middleware: defineValidator("body", Schema)
  },
  defineHandler(async (req) => {
    const userId = req.user!.id;
    const data = req.validatedBody as z.infer<typeof Schema>;

    if (data.transactionType !== "DEPOSIT") {
      throw HttpException.badRequest("Transaction must be a deposit request");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        email: true,
        name: true,
        account: {
          select: {
            walletBalance: true
          }
        }
      }
    });

    if (!user) {
      throw HttpException.notFound("User not found");
    }

    const lastDepositRequest = await prisma.transaction.findFirst({
      where: {
        userId,
        transactionType: "DEPOSIT",
        transactionStatus: "PENDING",
        amountInUSD: data.amountInUSD,
        createdAt: {
          gte: new Date(Date.now() - DUPLICATE_TRANSACTION_CHECK_TIME)
        }
      }
    });

    if (lastDepositRequest) {
      throw HttpException.badRequest(
        "Possible duplicate deposit request detected. Please, wait a little before trying again."
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        ...data
      }
    });
    alertEmitter.emit("deposit:create", { user, transaction });

    const payload: DepositCeateApiResponse = {
      success: true,
      message: "Deposit request created.",
      transaction,
      statusCode: 201
    };
    return payload;
  })
);
