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
const decimal_js_1 = __importDefault(require("decimal.js"));
const zod_1 = require("zod");
const Schema = zod_1.z
    .object({
    amountInUSD: zod_1.z
        .number({ message: "Transaction amount must be a number" })
        .min(0, { message: "Transaction amount must be a positive number" })
        .optional(),
    cards: zod_1.z
        .array(zod_1.z.object({
        type: zod_1.z.string({ message: "Gift card type is required" }),
        country: zod_1.z.string({ message: "Gift card country is required" }),
        cardNumber: zod_1.z.string({ message: "Gift card number is required" }),
        pin: zod_1.z.string({ message: "Gift card pin is required" }),
        amount: zod_1.z
            .number({ message: "Gift card amount is required" })
            .min(0, { message: "Gift card amount must be greater than 0" }),
        currency: zod_1.z.enum(["USD", "CAD", "GBP"]),
        amountRetrieved: zod_1.z
            .number({ message: "Amount retrieved must be a number" })
            .min(0, { message: "Amount retrieved must be greater than 0" }),
        rateUsed: zod_1.z.number({ message: "Rate used must be a number" }).optional()
    }))
        .optional()
})
    .optional();
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/transactions/:transaction_id/approve",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { transaction_id } = req.params;
    const data = req.validatedBody;
    const update = data?.amountInUSD
        ? {
            amountInUSD: data.amountInUSD,
            actualAmountInUSD: data.amountInUSD,
            amountInCurrency: data.amountInUSD
        }
        : undefined;
    const transaction = await prisma_1.default.transaction.findUnique({
        where: { id: transaction_id }
    });
    if (!transaction)
        throw http_1.HttpException.notFound("Transaction not found");
    let giftCardData = transaction.giftCardData || undefined;
    if (giftCardData) {
        giftCardData = {
            ...giftCardData,
            cards: [...(data?.cards || giftCardData.cards)]
        };
    }
    const promises = [];
    promises.push(prisma_1.default.transaction.update({
        where: { id: transaction.id },
        data: {
            ...update,
            giftCardData,
            transactionStatus: "SUCCESSFUL",
            approvedAt: new Date()
        },
        include: { user: true }
    }));
    if (transaction.transactionType === "DEPOSIT") {
        const account = await prisma_1.default.account.findUnique({
            where: { userId: transaction.userId }
        });
        if (!account)
            throw http_1.HttpException.notFound("User's account not found");
        const walletBalance = new decimal_js_1.default(account.walletBalance);
        const amountInUSD = new decimal_js_1.default(transaction.amountInUSD);
        promises.push(prisma_1.default.account.update({
            where: { id: account.id },
            data: {
                walletBalance: walletBalance.plus(amountInUSD).toDecimalPlaces(2).toNumber()
            }
        }));
    }
    const [updatedTransaction] = (await prisma_1.default.$transaction(promises));
    alert_event_1.alertEmitter.emit("transaction:status-update", {
        transaction: updatedTransaction,
        user: updatedTransaction.user
    });
    return {
        success: true,
        message: "Transaction marked as approved",
        transaction: updatedTransaction
    };
}));
