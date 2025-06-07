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
    path: "account",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: {
            account: true
        }
    });
    if (!user || !user.account) {
        throw http_1.HttpException.notFound("Account not found");
    }
    const { account } = user;
    if (!account) {
        throw http_1.HttpException.notFound("Account not found");
    }
    /* @ts-ignore */
    delete user.password;
    const payload = {
        success: true,
        user: {
            ...user,
            account
        }
    };
    return payload;
}));
