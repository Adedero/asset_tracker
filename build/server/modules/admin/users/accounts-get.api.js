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
    path: "/accounts{/:account_id}"
}, (0, handlers_1.defineHandler)(async (req) => {
    const { account_id } = req.params;
    const parsedQuery = req.parsedQuery;
    if (account_id) {
        const account = await prisma_1.default.account.findUnique({
            where: { id: account_id },
            include: { user: true }
        });
        if (!account) {
            throw http_1.HttpException.notFound("Account not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            account
        };
        return payload;
    }
    const accounts = await prisma_1.default.account.findMany({
        //@ts-ignore
        where: { ...(parsedQuery?.where || {}) },
        include: { user: true },
        orderBy: parsedQuery?.sort,
        take: parsedQuery?.take,
        skip: parsedQuery?.skip
    });
    const payload = {
        success: true,
        message: "Successful",
        accounts
    };
    return payload;
}));
