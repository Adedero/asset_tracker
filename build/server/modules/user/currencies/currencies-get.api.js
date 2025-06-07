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
    path: "/currencies{/:currency_id}",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const currency_id = req.params.currency_id?.toString();
    const parsedQuery = req.parsedQuery;
    if (currency_id) {
        const currency = await prisma_1.default.currency.findUnique({
            where: { id: currency_id, ...(parsedQuery?.where || {}) }
        });
        if (!currency) {
            throw http_1.HttpException.notFound("Not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            currency
        };
        return payload;
    }
    const currencies = await prisma_1.default.currency.findMany({
        where: { ...(parsedQuery?.where || {}) },
        orderBy: parsedQuery?.sort,
        take: parsedQuery?.take,
        skip: parsedQuery?.skip
    });
    const payload = {
        success: true,
        message: "Successful",
        currencies
    };
    return payload;
}));
