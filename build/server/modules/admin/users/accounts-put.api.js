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
    walletBalance: zod_1.z.number({ message: "Wallet balance must be a number" }).optional(),
    kycIdType: zod_1.z.string({ message: "The KYC ID type must be a string" }).nullable().optional(),
    kycDocument: zod_1.z
        .string({ message: "The KYC document type must be a string" })
        .nullable()
        .optional(),
    kycDocumentExt: zod_1.z
        .string({ message: "The KYC document extension type must be a string" })
        .nullable()
        .optional(),
    kycStatus: zod_1.z
        .enum([index_1.KycStatus.PENDING, index_1.KycStatus.VERIFIED, index_1.KycStatus.UNVERIFIED], {
        message: "The KYC status must be a string"
    })
        .optional(),
    kycSubmittedAt: zod_1.z.coerce
        .date({ message: "The KYC submitted at must be a date" })
        .nullable()
        .optional(),
    kycVerifiedAt: zod_1.z.coerce
        .date({ message: "The KYC verified at must be a date" })
        .nullable()
        .optional()
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/accounts/:account_id",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { account_id } = req.params;
    const data = req.validatedBody;
    const account = await prisma_1.default.account.update({
        where: {
            id: account_id
        },
        data
    });
    return {
        success: true,
        message: "Account updated successfully",
        account
    };
}));
