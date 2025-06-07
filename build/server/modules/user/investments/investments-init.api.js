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
    path: "investments/initialize/:investment_plan_slug",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const { investment_plan_slug } = req.params;
    const [plan, account] = await Promise.all([
        prisma_1.default.investmentPlan.findUnique({
            where: { slug: investment_plan_slug }
        }),
        prisma_1.default.account.findUnique({
            where: { userId },
            select: { walletBalance: true }
        })
    ]);
    if (!plan) {
        throw http_1.HttpException.notFound("Investment plan not found.");
    }
    const payload = {
        success: true,
        message: "Successful",
        plan,
        walletBalance: account?.walletBalance || 0
    };
    return payload;
}));
