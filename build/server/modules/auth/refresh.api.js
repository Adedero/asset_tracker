"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const env_1 = __importDefault(require("#src/utils/env"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.default = (0, api_1.api)({
    group: "/auth",
    path: "/refresh/:refreshToken",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const refreshToken = req.params.refreshToken;
    const payload = jsonwebtoken_1.default.verify(refreshToken, env_1.default.get("JWT_REFRESH_SECRET"));
    const { id } = payload;
    const user = await prisma_1.default.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) {
        throw http_1.HttpException.notFound("User not found");
    }
    const newAccessToken = jsonwebtoken_1.default.sign({ id: user.id }, env_1.default.get("JWT_ACCESS_SECRET"));
    return {
        accessToken: newAccessToken,
        success: true
    };
}));
