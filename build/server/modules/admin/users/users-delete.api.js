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
    path: "/users/:user_id",
    method: "delete"
}, (0, handlers_1.defineHandler)(async (req) => {
    const { user_id } = req.params;
    throw http_1.HttpException.internal();
    await prisma_1.default.user.delete({
        where: {
            id: user_id
        }
    });
    return {
        success: true,
        message: "User deleted successfully"
    };
}));
