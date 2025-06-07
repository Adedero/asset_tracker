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
    path: "/investments{/:investment_id}",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const investment_id = req.params.investment_id?.toString();
    const parsedQuery = req.parsedQuery;
    if (investment_id) {
        const investment = await prisma_1.default.investment.findUnique({
            where: { id: investment_id, userId }
        });
        if (!investment) {
            throw http_1.HttpException.notFound("Not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            investment
        };
        return payload;
    }
    const investments = await prisma_1.default.investment.findMany({
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
        investments
    };
    return payload;
}));
