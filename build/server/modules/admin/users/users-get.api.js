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
    path: "/users{/:user_id}",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const user_id = req.params.user_id?.toString();
    const parsedQuery = req.parsedQuery;
    if (user_id) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: user_id },
            include: {
                account: true,
                ban: true,
                accountGroup: true,
                ...(parsedQuery?.populate || {})
            }
        });
        if (!user) {
            throw http_1.HttpException.notFound("User not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            user
        };
        return payload;
    }
    const users = await prisma_1.default.user.findMany({
        //@ts-ignore
        where: { ...(parsedQuery?.where || {}) },
        include: {
            accountGroup: {
                select: { name: true, id: true }
            }
        },
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
        //@ts-ignore
        users
    };
    return payload;
}));
