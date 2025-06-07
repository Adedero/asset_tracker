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
const Schema = zod_1.z.object({
    name: zod_1.z.string({ message: "Name is required" }).optional(),
    slug: zod_1.z.string({ message: "Slug is required" }).optional(),
    image: zod_1.z.string({ message: "Image is required" }).optional(),
    tiers: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string({ message: "Tier name is required" }),
        minimumDeposit: zod_1.z
            .number({ message: "Minimum deposit must be a number" })
            .gt(0, { message: "Minimum deposit must be greater than 0" }),
        duration: zod_1.z
            .number({ message: "Duration must be a number" })
            .int({ message: "Duration must be an integer" })
            .gt(0, { message: "Duration must be greater than 0" }),
        expectedReturnRate: zod_1.z
            .number({ message: "Expected return rate must be a number" })
            .gt(0, { message: "Expected return rate must be greater than 0" }),
        terminationFee: zod_1.z
            .number({ message: "Termination fee must be a number" })
            .min(0, { message: "Termination fee must be 0 or greater" })
    }), { message: "Investment tiers must be an array" })
        .optional()
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/investment-plans/:investment_plan_id",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { investment_plan_id } = req.params;
    const data = req.validatedBody;
    const existingInvestmentPlan = await prisma_1.default.investmentPlan.findFirst({
        where: {
            AND: {
                id: { not: investment_plan_id },
                OR: [{ name: data.name }, { slug: data.slug }]
            }
        }
    });
    if (existingInvestmentPlan) {
        throw http_1.HttpException.badRequest("And investment plan with this name or slug already exists");
    }
    const investmentPlan = await prisma_1.default.investmentPlan.update({
        where: { id: investment_plan_id },
        data
    });
    return {
        statusCode: 201,
        success: true,
        message: "Investment plan updated successfully",
        investmentPlan
    };
}));
