"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const alert_event_1 = require("#src/events/alert.event");
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const index_1 = require("#src/prisma-gen/index");
const constants_1 = require("#src/utils/constants");
const zod_1 = require("zod");
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
    charge: zod_1.z.number(),
    actualAmountInUSD: zod_1.z.number(),
    rate: zod_1.z.number(),
    currency: zod_1.z.string(),
    amountInCurrency: zod_1.z.number(),
    isWireTransfer: zod_1.z.boolean(),
    isGiftCard: zod_1.z.boolean().optional(),
    giftCardData: zod_1.z
        .object({
        rates: zod_1.z.object({
            USD: zod_1.z.number(),
            CAD: zod_1.z.number().optional(),
            GBP: zod_1.z.number().optional()
        }),
        totalInUSD: zod_1.z.number().positive(),
        cards: zod_1.z.array(zod_1.z.object({
            type: zod_1.z.string(),
            country: zod_1.z.string(),
            cardNumber: zod_1.z.string(),
            pin: zod_1.z.string(),
            amount: zod_1.z.number().positive(),
            currency: zod_1.z.enum(["USD", "CAD", "GBP"])
        }))
    })
        .optional(),
    depositWalletAddress: zod_1.z.string().optional(),
    depositWalletAddressNetwork: zod_1.z.string().optional(),
    description: zod_1.z.string().optional()
});
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/transactions/deposit",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const data = req.validatedBody;
    if (data.transactionType !== "DEPOSIT") {
        throw http_1.HttpException.badRequest("Transaction must be a deposit request");
    }
    const user = await prisma_1.default.user.findUnique({
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
        throw http_1.HttpException.notFound("User not found");
    }
    const lastDepositRequest = await prisma_1.default.transaction.findFirst({
        where: {
            userId,
            transactionType: "DEPOSIT",
            transactionStatus: "PENDING",
            amountInUSD: data.amountInUSD,
            createdAt: {
                gte: new Date(Date.now() - constants_1.DUPLICATE_TRANSACTION_CHECK_TIME)
            }
        }
    });
    if (lastDepositRequest) {
        throw http_1.HttpException.badRequest("Possible duplicate deposit request detected. Please, wait a little before trying again.");
    }
    const transaction = await prisma_1.default.transaction.create({
        data: {
            userId,
            ...data
        }
    });
    alert_event_1.alertEmitter.emit("deposit:create", { user, transaction });
    const payload = {
        success: true,
        message: "Deposit request created.",
        transaction,
        statusCode: 201
    };
    return payload;
}));
