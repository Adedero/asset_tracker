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
    email: zod_1.z.string({ message: "Email is required" }).email({ message: "Invalid email" })
});
exports.default = (0, api_1.api)({
    group: "/auth",
    path: "/recovery/confirm-email",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { email } = req.validatedBody;
    const user = await prisma_1.default.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true }
    });
    if (!user) {
        throw http_1.HttpException.notFound("Account not found");
    }
    const payload = {
        success: true,
        message: "Email confirmed successfully",
        user
    };
    return payload;
}));
