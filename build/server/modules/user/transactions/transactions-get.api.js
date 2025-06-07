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
    path: "/transactions{/:transaction_id}",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const transaction_id = req.params.transaction_id?.toString();
    const parsedQuery = req.parsedQuery;
    if (transaction_id) {
        const transaction = await prisma_1.default.transaction.findUnique({
            where: { id: transaction_id, userId }
        });
        if (!transaction) {
            throw http_1.HttpException.notFound("Not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            transaction
        };
        return payload;
    }
    const transactions = await prisma_1.default.transaction.findMany({
        //@ts-ignore
        where: { userId, ...(parsedQuery?.where || {}) },
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
        transactions
    };
    return payload;
}));
