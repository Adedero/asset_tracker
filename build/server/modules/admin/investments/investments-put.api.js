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
const enums_1 = require("#src/prisma-gen/enums");
const zod_1 = require("zod");
const Schema = zod_1.z.object({
    investmentStatus: zod_1.z
        .enum([
        enums_1.InvestmentStatus.CLOSED,
        enums_1.InvestmentStatus.OPEN,
        enums_1.InvestmentStatus.PAUSED,
        enums_1.InvestmentStatus.TERMINATED
    ], { message: "Invalid investment status provided" })
        .optional(),
    pausedAt: zod_1.z.coerce.date().nullable().optional(),
    pausedReason: zod_1.z.string().nullable().optional(),
    terminatedAt: zod_1.z.coerce.date().nullable().optional(),
    terminator: zod_1.z.string().nullable().optional(),
    terminationReason: zod_1.z.string().nullable().optional(),
    terminationFeeApplied: zod_1.z.boolean().optional(),
    isPausing: zod_1.z.boolean().optional()
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/investments/:investment_id",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { investment_id } = req.params;
    const data = req.validatedBody;
    const { isPausing } = data;
    delete data.isPausing;
    const investment = await prisma_1.default.investment.update({
        where: { id: investment_id },
        include: { user: true },
        data
    });
    if (!investment) {
        throw http_1.HttpException.notFound("Investment not found");
    }
    if (isPausing !== undefined) {
        alert_event_1.alertEmitter.emit("investment:pause-toggle", { investment, user: investment.user });
    }
    return {
        success: true,
        message: "Investment updated successfully",
        investment
    };
}));
