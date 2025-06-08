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
    name: zod_1.z.string().trim().min(2, { message: "Name must be at least 2 characters long" }).optional(),
    symbol: zod_1.z.string().trim().optional(),
    abbr: zod_1.z.string().trim().toUpperCase().optional(),
    image: zod_1.z.string().trim().optional(),
    rate: zod_1.z.number().min(0, { message: "Rate must be not be less than 0" }).optional(),
    rateUpdatedAt: zod_1.z.coerce.date().optional(),
    walletAddress: zod_1.z.string().trim().optional(),
    walletAddressNetwork: zod_1.z.string().trim().optional(),
    isAvailableForWithdrawal: zod_1.z.boolean().optional(),
    withdrawalCharge: zod_1.z
        .number()
        .min(0, { message: "Withdrawal charge must not be less than 0" })
        .optional()
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/currencies/:currency_id",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const data = req.validatedBody;
    const { currency_id } = req.params;
    const existingCurrency = await prisma_1.default.currency.findFirst({
        where: {
            AND: {
                id: { not: currency_id },
                OR: [{ name: data.name }, { abbr: data.abbr }]
            }
        }
    });
    if (existingCurrency) {
        throw http_1.HttpException.badRequest("A currency with this name or abbreviation already exists");
    }
    const currency = await prisma_1.default.currency.update({
        where: { id: currency_id },
        data
    });
    return {
        success: true,
        message: "Currency updated successfully",
        currency
    };
}));
