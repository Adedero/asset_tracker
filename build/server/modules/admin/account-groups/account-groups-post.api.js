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
    name: zod_1.z.string({ message: "Name is requuired" }).trim(),
    description: zod_1.z.string().trim().optional(),
    currencies: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string({ message: "Currency ID is required" }),
        walletAddress: zod_1.z.string({ message: "Currency wallet address is required" }),
        walletAddressNetwork: zod_1.z
            .string({ message: "Currency wallet address network must be a string" })
            .optional()
    }), { message: "Currencies must be an array" })
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/account-groups",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const data = req.validatedBody;
    const existingAccountGroup = await prisma_1.default.accountGroup.findUnique({
        where: { name: data.name }
    });
    if (existingAccountGroup) {
        throw http_1.HttpException.badRequest("A account group with this name already exists");
    }
    const accountGroup = await prisma_1.default.accountGroup.create({
        data
    });
    return {
        statusCode: 201,
        success: true,
        message: "Account group created successfully",
        accountGroup
    };
}));
