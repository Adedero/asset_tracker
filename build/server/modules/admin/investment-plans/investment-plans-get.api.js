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
    group: "/admins/me",
    path: "/investment-plans{/:investment_plan_id}"
}, (0, handlers_1.defineHandler)(async (req) => {
    const { investment_plan_id } = req.params;
    const parsedQuery = req.parsedQuery;
    if (investment_plan_id) {
        const investmentPlan = await prisma_1.default.investmentPlan.findUnique({
            where: { id: investment_plan_id }
        });
        if (!investmentPlan) {
            throw http_1.HttpException.notFound("InvestmentPlan not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            investmentPlan
        };
        return payload;
    }
    const investmentPlans = await prisma_1.default.investmentPlan.findMany({
        //@ts-ignore
        where: { ...(parsedQuery?.where || {}) },
        /*  //@ts-ignore
        select: {
          ...(parsedQuery?.select || {}),
          ...(parsedQuery?.populate || {}),
          ...(parsedQuery?.exclude || {})
        }, */
        orderBy: parsedQuery?.sort,
        take: parsedQuery?.take,
        skip: parsedQuery?.skip
    });
    const payload = {
        success: true,
        message: "Successful",
        investmentPlans
    };
    return payload;
}));
