"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const index_1 = require("#src/prisma-gen/index");
const zod_1 = require("zod");
const Schema = zod_1.z.object({
    kycIdType: zod_1.z.string().optional(),
    kycDocument: zod_1.z.string().optional(),
    kycDocumentExt: zod_1.z.string().optional(),
    kycStatus: zod_1.z.enum([index_1.KycStatus.PENDING, index_1.KycStatus.VERIFIED, index_1.KycStatus.UNVERIFIED]).optional(),
    kycSubmittedAt: zod_1.z.string().optional()
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/account",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const data = req.validatedBody;
    const userId = req.user.id;
    await prisma_1.default.account.update({
        where: { userId },
        data: {
            ...data,
            kycSubmittedAt: data.kycSubmittedAt ? new Date(data.kycSubmittedAt) : undefined
        }
    });
    return {
        success: true,
        message: "Account updated successfully"
    };
}));
