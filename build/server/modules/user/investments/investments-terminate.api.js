"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const zod_1 = require("zod");
const decimal_js_1 = __importDefault(require("decimal.js"));
const alert_event_1 = require("#src/events/alert.event");
const Schema = zod_1.z.object({
    terminationReason: zod_1.z.string({ message: "Termination reason is required" })
});
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "investments/:investment_id/terminate",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { investment_id } = req.params;
    const { terminationReason } = req.validatedBody;
    const investment = await prisma_1.default.investment.findUnique({
        where: { id: investment_id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    account: {
                        select: {
                            id: true,
                            walletBalance: true
                        }
                    }
                }
            }
        }
    });
    if (!investment) {
        throw http_1.HttpException.notFound("Investment not found");
    }
    if (investment.investmentStatus === "TERMINATED" || investment.investmentStatus === "CLOSED") {
        throw http_1.HttpException.badRequest("Investment is already resolved and cannot be terminated");
    }
    const { account } = investment.user;
    if (!account) {
        throw http_1.HttpException.notFound("Account not found");
    }
    const walletBalance = new decimal_js_1.default(account.walletBalance || 0);
    const initialDeposit = new decimal_js_1.default(investment.initialDeposit || 0);
    const currentTotalReturns = new decimal_js_1.default(investment.currentTotalReturns || 0);
    const terminationFee = new decimal_js_1.default(investment.terminationFee || 0);
    const updatedInvestment = {};
    let updatedWalletBalance = 0;
    if (investment.autocompounded) {
        if (investment.currentTotalReturns >= investment.initialDeposit) {
            updatedWalletBalance = walletBalance
                .plus(currentTotalReturns.minus(terminationFee))
                .toDecimalPlaces(2)
                .toNumber();
        }
        else {
            const balance = initialDeposit.minus(currentTotalReturns.minus(terminationFee));
            updatedWalletBalance = walletBalance
                .plus(currentTotalReturns.plus(balance))
                .toDecimalPlaces(2)
                .toNumber();
        }
        updatedInvestment.hasTransferedProfitToWallet = true;
    }
    if (!investment.autocompounded) {
        if (investment.currentTotalReturns >= investment.initialDeposit) {
            if (walletBalance.minus(terminationFee).lessThan(0)) {
                throw http_1.HttpException.badRequest("Insufficient funds to pay the investment termination fee");
            }
            updatedWalletBalance = walletBalance.minus(terminationFee).toDecimalPlaces(2).toNumber();
        }
        else {
            const debt = initialDeposit.minus(currentTotalReturns.minus(terminationFee));
            if (walletBalance.plus(debt).lessThan(0)) {
                throw http_1.HttpException.badRequest("Insufficient funds to pay the investment termination fee");
            }
            updatedWalletBalance = walletBalance.plus(debt).toDecimalPlaces(2).toNumber();
        }
    }
    updatedInvestment.investmentStatus = "TERMINATED";
    updatedInvestment.terminator = "USER";
    updatedInvestment.terminatedAt = new Date();
    updatedInvestment.closedAt = new Date();
    updatedInvestment.terminationFeeApplied = true;
    updatedInvestment.terminationReason = terminationReason;
    await prisma_1.default.$transaction([
        prisma_1.default.investment.update({
            where: { id: investment.id },
            data: updatedInvestment
        }),
        prisma_1.default.account.update({
            where: { id: account.id },
            data: { walletBalance: updatedWalletBalance }
        })
    ]);
    const payload = {
        success: true,
        message: "Investment terminated",
        investment: { ...investment, ...updatedInvestment }
    };
    alert_event_1.alertEmitter.emit("investment:terminate", {
        investment: { ...investment, ...updatedInvestment },
        user: investment.user
    });
    return payload;
}));
