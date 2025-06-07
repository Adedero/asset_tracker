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
    name: zod_1.z.string({ message: "Name is requuired" }).trim().optional(),
    description: zod_1.z.string().trim().optional(),
    currencies: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.string({ message: "Currency ID is required" }),
        walletAddress: zod_1.z.string({ message: "Currency wallet address is required" }),
        walletAddressNetwork: zod_1.z
            .string({ message: "Currency wallet address network must be a string" })
            .optional()
    }), { message: "Currencies must be an array" })
        .optional()
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/account-groups/:account_group_id",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { account_group_id } = req.params;
    const data = req.validatedBody;
    const existingAccountGroup = await prisma_1.default.accountGroup.findFirst({
        where: {
            AND: [{ name: data.name }, { id: { not: account_group_id } }]
        }
    });
    if (existingAccountGroup) {
        throw http_1.HttpException.badRequest("A account group with this name already exists");
    }
    const accountGroup = await prisma_1.default.accountGroup.update({
        where: { id: account_group_id },
        data
    });
    return {
        success: true,
        message: "Account group updated successfully",
        accountGroup
    };
}));
