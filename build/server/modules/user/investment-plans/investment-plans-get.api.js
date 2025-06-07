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
    path: "/investment-plans{/:investment_plan_id}",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const investment_plan_id = req.params.investment_plan_id?.toString();
    const parsedQuery = req.parsedQuery;
    if (investment_plan_id) {
        const investmentPlan = await prisma_1.default.investmentPlan.findUnique({
            where: { id: investment_plan_id }
        });
        if (!investmentPlan) {
            throw http_1.HttpException.notFound("Not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            plan: investmentPlan
        };
        return payload;
    }
    const investmentPlans = await prisma_1.default.investmentPlan.findMany();
    const payload = {
        success: true,
        message: "Successful",
        plans: investmentPlans
    };
    return payload;
}));
