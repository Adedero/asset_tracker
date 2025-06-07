"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const zod_1 = require("zod");
const Schema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, { message: "Name must be at least 2 characters long" }).optional(),
    image: zod_1.z.string().trim().optional(),
    phoneNumber: zod_1.z.string().trim().optional(),
    address: zod_1.z.string().trim().optional(),
    country: zod_1.z.string().trim().optional(),
    region: zod_1.z.string().trim().optional()
});
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const data = req.validatedBody;
    const userId = req.user.id;
    await prisma_1.default.user.update({
        where: { id: userId },
        data
    });
    return {
        success: true,
        message: "Profile updated successfully"
    };
}));
