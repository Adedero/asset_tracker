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
const Schema = zod_1.z.object({
    failReason: zod_1.z.string({ message: "Reason for failing the transaction is required" })
}, { message: "No request body provided" });
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/transactions/:transaction_id/fail",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { transaction_id } = req.params;
    const { failReason } = req.validatedBody;
    const transaction = await prisma_1.default.transaction.findUnique({
        where: { id: transaction_id }
    });
    if (!transaction)
        throw http_1.HttpException.notFound("Transaction not found");
    const promises = [];
    promises.push(prisma_1.default.transaction.update({
        where: { id: transaction.id },
        data: {
            transactionStatus: "FAILED",
            approvedAt: null,
            failedAt: new Date(),
            failReason
        },
        include: { user: true }
    }));
    if (transaction.transactionType === "WITHDRAWAL") {
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
        message: "Transaction marked as failed",
        transaction: updatedTransaction
    };
}));
