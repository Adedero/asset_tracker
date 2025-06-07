"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/dashboard",
    method: "get"
}, (0, handlers_1.defineHandler)(async () => {
    const [usersCount, adminsCount, openInvestmentsCount, currenciesCount, investmentPlansCount, recentTransactions, recentInvestments] = await Promise.all([
        prisma_1.default.user.count({ where: { role: "USER" } }),
        prisma_1.default.user.count({ where: { role: "ADMIN" } }),
        prisma_1.default.investment.count({ where: { investmentStatus: "OPEN" } }),
        prisma_1.default.currency.count({}),
        prisma_1.default.investmentPlan.count({}),
        prisma_1.default.transaction.findMany({
            include: { user: true },
            orderBy: { createdAt: "desc" },
            take: 3
        }),
        prisma_1.default.investment.findMany({
            include: { user: true },
            orderBy: { createdAt: "desc" },
            take: 3
        })
    ]);
    const payload = {
        overview: {
            usersCount,
            adminsCount,
            openInvestmentsCount,
            currenciesCount,
            investmentPlansCount,
            recentTransactions,
            recentInvestments
        }
    };
    return payload;
}));
