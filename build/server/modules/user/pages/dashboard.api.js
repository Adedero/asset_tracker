"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/dashboard",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            account: { select: { walletBalance: true } }
        }
    });
    if (!user) {
        throw http_1.HttpException.notFound("User not found");
    }
    const activeInvestments = await prisma_1.default.investment.findMany({
        where: { userId: user.id, investmentStatus: "OPEN" }
    });
    const { tid, tr, nwr } = activeInvestments.reduce((acc, inv) => {
        acc.tid += inv.initialDeposit;
        acc.tr += inv.currentTotalReturns;
        if (inv.autocompounded) {
            acc.nwr += inv.currentTotalReturns;
        }
        return acc;
    }, { tid: 0, tr: 0, nwr: 0 });
    const payload = {
        success: true,
        message: "Successful",
        overview: {
            walletBalance: user.account?.walletBalance || 0,
            activeInvestments: activeInvestments.length,
            totalInvestmentDeposit: tid,
            totalReturns: tr,
            nonWithdrawableReturns: nwr
        }
    };
    return payload;
}));
