"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const http_1 = require("#src/lib/api/http");
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/investment-plans{/:investment_plan_id}",
    method: "delete"
}, (0, handlers_1.defineHandler)(async (req) => {
    const { investment_plan_id } = req.params;
    const investmentPlan = await prisma_1.default.investmentPlan.delete({
        where: { id: investment_plan_id }
    });
    if (!investmentPlan) {
        throw http_1.HttpException.notFound("InvestmentPlan not found");
    }
    const payload = {
        success: true,
        message: "Investment plan deleted successfully",
        investmentPlan
    };
    return payload;
}));
