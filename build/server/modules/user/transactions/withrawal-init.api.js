"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const zod_1 = require("zod");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const http_1 = require("#src/lib/api/http");
//Initi data and currencies
const Schema = zod_1.z.object({
    symbol: zod_1.z.string({ message: "Currency symbol is required" }).toUpperCase()
});
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/transactions/withdrawal/initialize",
    method: "get",
    middleware: (0, handlers_1.defineValidator)("query", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const { symbol } = req.validatedQuery;
    const [currency, user] = await Promise.all([
        prisma_1.default.currency.findUnique({
            where: { abbr: symbol }
        }),
        prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                account: {
                    select: {
                        walletBalance: true
                    }
                }
            }
        })
    ]);
    if (!user) {
        throw http_1.HttpException.notFound("Account not found");
    }
    if (!currency) {
        throw http_1.HttpException.notFound("Currency not found");
    }
    //const updatedCurrency = await getUpdatedCurrencyData(currency);
    const payload = {
        success: true,
        message: "Successful",
        currency,
        user: {
            walletBalance: user.account?.walletBalance || 0
        }
    };
    return payload;
}));
