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
    name: zod_1.z.string().trim().min(2, { message: "Name must be at least 2 characters long" }),
    symbol: zod_1.z.string().trim(),
    abbr: zod_1.z.string().trim().toUpperCase(),
    image: zod_1.z.string().trim().optional(),
    rate: zod_1.z
        .number()
        .min(0, { message: "Rate must be greater than 0" })
        .positive({ message: "Rate must be positive" }),
    rateUpdatedAt: zod_1.z.coerce.date().optional(),
    walletAddress: zod_1.z.string({ message: "Wallet address is required" }).trim(),
    walletAddressNetwork: zod_1.z.string().trim().optional(),
    isAvailableForWithdrawal: zod_1.z.boolean().optional(),
    withdrawalCharge: zod_1.z.number().min(0, { message: "Rate must not be less than 0" }).optional()
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/currencies",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const data = req.validatedBody;
    const existingCurrency = await prisma_1.default.currency.findFirst({
        where: {
            OR: [{ name: data.name }, { abbr: data.abbr }]
        }
    });
    if (existingCurrency) {
        throw http_1.HttpException.badRequest("A currency with this name or abbreviation already exists");
    }
    const currency = await prisma_1.default.currency.create({
        data
    });
    return {
        statusCode: 201,
        success: true,
        message: "Currency created successfully",
        currency
    };
}));
