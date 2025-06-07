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
const zod_1 = require("zod");
const decimal_js_1 = __importDefault(require("decimal.js"));
const alert_event_1 = require("#src/events/alert.event");
const Schema = zod_1.z.object({
    autocompounded: zod_1.z.boolean(),
    investmentStatus: zod_1.z
        .enum([index_1.InvestmentStatus.OPEN, index_1.InvestmentStatus.CLOSED, index_1.InvestmentStatus.TERMINATED])
        .optional(),
    initialDeposit: zod_1.z.number(),
    expectedReturnRate: zod_1.z.number(),
    autocompoundedReturnRate: (0, zod_1.number)().optional(),
    expectedTotalReturns: zod_1.z.number(),
    currentTotalReturns: zod_1.z.number(),
    currentCompoundedAmount: zod_1.z.number().optional(),
    investmentName: zod_1.z.string(),
    investmentTier: zod_1.z.string(),
    minimumDeposit: zod_1.z.number(),
    duration: zod_1.z.number(),
    terminationFee: zod_1.z.number(),
    daysCompleted: zod_1.z.number()
});
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/investments",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    decimal_js_1.default.set({ precision: 5, rounding: 2 });
    const userId = req.user.id;
    const data = req.validatedBody;
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { id: true, account: { select: { walletBalance: true } } }
    });
    if (!user || !user.account) {
        throw http_1.HttpException.notFound("User not found.");
    }
    if (!user.account.walletBalance || user.account.walletBalance < data.initialDeposit) {
        throw http_1.HttpException.badRequest("Insufficient funds.");
    }
    const walletBalance = new decimal_js_1.default(user.account.walletBalance);
    const initialDeposit = new decimal_js_1.default(data.initialDeposit);
    const updatedWalletBalance = walletBalance.minus(initialDeposit).toNumber();
    const investment = await prisma_1.default.$transaction(async (txn) => {
        const inv = await txn.investment.create({
            data: { ...data, userId }
        });
        await txn.transaction.create({
            data: {
                userId,
                investmentId: inv.id,
                transactionType: index_1.TransactionType.INVESTMENT,
                transactionStatus: index_1.TransactionStatus.SUCCESSFUL,
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
    alert_event_1.alertEmitter.emit("investment:create", { user: req.user, investment });
    const payload = {
        success: true,
        investment
    };
    return payload;
}));
