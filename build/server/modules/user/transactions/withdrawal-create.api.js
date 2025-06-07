"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const index_1 = require("#src/prisma-gen/index");
const constants_1 = require("#src/utils/constants");
const zod_1 = require("zod");
const alert_event_1 = require("#src/events/alert.event");
const Schema = zod_1.z.object({
    transactionType: zod_1.z.enum([
        index_1.TransactionType.DEPOSIT,
        index_1.TransactionType.WITHDRAWAL,
        index_1.TransactionType.INVESTMENT,
        index_1.TransactionType.PROFIT
    ]),
    transactionStatus: zod_1.z.enum([
        index_1.TransactionStatus.FAILED,
        index_1.TransactionStatus.PENDING,
        index_1.TransactionStatus.SUCCESSFUL
    ]),
    amountInUSD: zod_1.z.number(),
    charge: zod_1.z.number().optional(),
    actualAmountInUSD: zod_1.z.number().optional(),
    rate: zod_1.z.number(),
    currency: zod_1.z.string(),
    amountInCurrency: zod_1.z.number().optional(),
    isWireTransfer: zod_1.z.boolean(),
    withdrawalWalletAddress: zod_1.z.string(),
    withdrawalWalletAddressNetwork: zod_1.z.string().optional(),
    description: zod_1.z.string().optional()
});
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/transactions/withdrawal",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const data = req.validatedBody;
    if (data.transactionType !== "WITHDRAWAL") {
        throw http_1.HttpException.badRequest("Transaction must be a withdrawal request");
    }
    const [user, currency] = await Promise.all([
        prisma_1.default.user.findUnique({
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
        prisma_1.default.currency.findUnique({
            where: { abbr: data.currency },
            select: { rate: true, withdrawalCharge: true }
        })
    ]);
    if (!user || !user.account) {
        throw http_1.HttpException.notFound("User not found");
    }
    if (!currency) {
        throw http_1.HttpException.notFound("Failed to get currency data");
    }
    const amountInUSD = data.amountInUSD;
    const walletBalance = user.account.walletBalance;
    const updatedWalletBalance = walletBalance - amountInUSD;
    if (walletBalance - constants_1.MIN_ACCOUNT_BALANCE < amountInUSD) {
        throw http_1.HttpException.badRequest("You do not have suffient funds to complete this request");
    }
    const lastWithdrawalRequest = await prisma_1.default.transaction.findFirst({
        where: {
            userId,
            transactionType: "WITHDRAWAL",
            transactionStatus: "PENDING",
            amountInUSD: data.amountInUSD,
            createdAt: {
                gte: new Date(Date.now() - constants_1.DUPLICATE_TRANSACTION_CHECK_TIME)
            }
        }
    });
    if (lastWithdrawalRequest) {
        throw http_1.HttpException.badRequest("Possible duplicate withdrawal request detected. Please, wait a little before trying again.");
    }
    let rate = 0;
    if (currency.rate === data.rate) {
        rate = currency.rate;
    }
    else {
        rate = Math.min(currency.rate, data.rate || 0);
    }
    if (!rate) {
        throw http_1.HttpException.badRequest("Failed to get currency rate. Please, try again later.");
    }
    const [transaction] = await prisma_1.default.$transaction([
        prisma_1.default.transaction.create({
            data: {
                ...data,
                userId: user.id,
                charge: currency.withdrawalCharge,
                actualAmountInUSD: data.amountInUSD - currency.withdrawalCharge,
                rate,
                amountInCurrency: (data.amountInUSD - currency.withdrawalCharge) / rate
            }
        }),
        prisma_1.default.account.update({
            where: { userId: user.id },
            data: {
                walletBalance: updatedWalletBalance
            }
        })
    ]);
    alert_event_1.alertEmitter.emit("withdrawal:create", { user, transaction });
    const payload = {
        success: true,
        message: "Withdrawal request created.",
        transaction,
        statusCode: 201
    };
    return payload;
}));
