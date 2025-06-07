import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { TransactionStatus, TransactionType } from "#src/prisma-gen/index";
import { DUPLICATE_TRANSACTION_CHECK_TIME, MIN_ACCOUNT_BALANCE } from "#src/utils/constants";
import { z } from "zod";
import { alertEmitter } from "#src/events/alert.event";
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
    charge: z.number().optional(),
    actualAmountInUSD: z.number().optional(),
    rate: z.number(),
    currency: z.string(),
    amountInCurrency: z.number().optional(),
    isWireTransfer: z.boolean(),
    withdrawalWalletAddress: z.string(),
    withdrawalWalletAddressNetwork: z.string().optional(),
    description: z.string().optional()
});
export default api({
    group: "/users/me",
    path: "/transactions/withdrawal",
    method: "post",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const userId = req.user.id;
    const data = req.validatedBody;
    if (data.transactionType !== "WITHDRAWAL") {
        throw HttpException.badRequest("Transaction must be a withdrawal request");
    }
    const [user, currency] = await Promise.all([
        prisma.user.findUnique({
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
        }),
        prisma.currency.findUnique({
            where: { abbr: data.currency },
            select: { rate: true, withdrawalCharge: true }
        })
    ]);
    if (!user || !user.account) {
        throw HttpException.notFound("User not found");
    }
    if (!currency) {
        throw HttpException.notFound("Failed to get currency data");
    }
    const amountInUSD = data.amountInUSD;
    const walletBalance = user.account.walletBalance;
    const updatedWalletBalance = walletBalance - amountInUSD;
    if (walletBalance - MIN_ACCOUNT_BALANCE < amountInUSD) {
        throw HttpException.badRequest("You do not have suffient funds to complete this request");
    }
    const lastWithdrawalRequest = await prisma.transaction.findFirst({
        where: {
            userId,
            transactionType: "WITHDRAWAL",
            transactionStatus: "PENDING",
            amountInUSD: data.amountInUSD,
            createdAt: {
                gte: new Date(Date.now() - DUPLICATE_TRANSACTION_CHECK_TIME)
            }
        }
    });
    if (lastWithdrawalRequest) {
        throw HttpException.badRequest("Possible duplicate withdrawal request detected. Please, wait a little before trying again.");
    }
    let rate = 0;
    if (currency.rate === data.rate) {
        rate = currency.rate;
    }
    else {
        rate = Math.min(currency.rate, data.rate || 0);
    }
    if (!rate) {
        throw HttpException.badRequest("Failed to get currency rate. Please, try again later.");
    }
    const [transaction] = await prisma.$transaction([
        prisma.transaction.create({
            data: {
                ...data,
                userId: user.id,
                charge: currency.withdrawalCharge,
                actualAmountInUSD: data.amountInUSD - currency.withdrawalCharge,
                rate,
                amountInCurrency: (data.amountInUSD - currency.withdrawalCharge) / rate
            }
        }),
        prisma.account.update({
            where: { userId: user.id },
            data: {
                walletBalance: updatedWalletBalance
            }
        })
    ]);
    alertEmitter.emit("withdrawal:create", { user, transaction });
    const payload = {
        success: true,
        message: "Withdrawal request created.",
        transaction,
        statusCode: 201
    };
    return payload;
}));
