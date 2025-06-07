"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const constants_1 = require("#src/utils/constants");
const zod_1 = require("zod");
const Schema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, { message: "Name must be at least 2 characters long" }),
    email: zod_1.z.string().email({ message: "Invalid email address" }).trim(),
    password: zod_1.z.string().min(constants_1.MIN_PASSWORD_LENGTH, {
        message: `Password must be at least ${constants_1.MIN_PASSWORD_LENGTH} characters long`
    }),
    image: zod_1.z.string().trim().optional(),
    phoneNumber: zod_1.z.string().trim().optional(),
    address: zod_1.z.string().trim().optional(),
    country: zod_1.z.string().trim().optional(),
    region: zod_1.z.string().trim().optional(),
    verified: zod_1.z.boolean().optional()
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/users",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const data = req.validatedBody;
    const user = await prisma_1.default.user.create({
        data: {
            ...data,
            account: {
                create: {
                    walletBalance: 0
                }
            }
        }
    });
    return {
        success: true,
        message: "Profile updated successfully",
        user
    };
}));
