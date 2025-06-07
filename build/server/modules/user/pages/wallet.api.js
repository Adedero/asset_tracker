"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const constants_1 = require("#src/utils/constants");
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/wallet",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const [account, latestProfit, recentTransactions] = await Promise.all([
        prisma_1.default.account.findUnique({
            where: { userId },
            select: { walletBalance: true }
        }),
        prisma_1.default.profit.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" }
        }),
        prisma_1.default.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: constants_1.GET_REQUEST_DATA_LIMIT
        })
    ]);
    if (!account) {
        await prisma_1.default.account.create({
            data: { userId, walletBalance: 0 }
        });
    }
    const payload = {
        success: true,
        walletBalance: account?.walletBalance || 0,
        profit: latestProfit,
        transactions: recentTransactions
    };
    return payload;
}));
