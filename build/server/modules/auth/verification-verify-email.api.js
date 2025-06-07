"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const email_1 = require("#src/lib/email/email");
const button_1 = __importDefault(require("#src/lib/email/mail-templates/components/button"));
const generic_1 = __importDefault(require("#src/lib/email/mail-templates/generic"));
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const constants_1 = require("#src/utils/constants");
const env_1 = __importDefault(require("#src/utils/env"));
const token_1 = require("#src/utils/token");
const bcrypt_1 = require("bcrypt");
const zod_1 = require("zod");
const Schema = zod_1.z.object({
    email: zod_1.z.string({ message: "Email is required" }).email({ message: "Invalid email" }).optional(),
    emailToVerify: zod_1.z.string().email({ message: "Invalid email to verify" }).optional(),
    otp: zod_1.z
        .string({ message: "Invalid OTP" })
        .length(constants_1.OTP_LENGTH, { message: "Invalid OTP" })
        .optional(),
    token: zod_1.z.string({ message: "Invalid token" }).optional(),
    id: zod_1.z.string({ message: "Invalid id" }).optional()
});
exports.default = (0, api_1.api)({
    group: "/auth",
    path: "/verification/verify-email",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { otp, token, email, emailToVerify, id } = req.validatedBody;
    let query = null;
    if (id) {
        query = { id, ...(query || {}) };
    }
    if (email) {
        query = { email, ...(query || {}) };
    }
    if (!query) {
        return {
            success: false,
            message: "Invalid request. Please try again."
        };
    }
    const user = await prisma_1.default.user.findUnique({
        where: query,
        select: { id: true, name: true, email: true, verified: true }
    });
    if (!user) {
        return {
            success: false,
            message: "Account not found. Please register to continue."
        };
    }
    if (user.verified && email === emailToVerify) {
        return {
            success: true,
            message: "Email verified successfully.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }
    let isValid = false;
    if (otp) {
        const tokenData = await prisma_1.default.token.findUnique({
            where: { userId: id },
            select: { value: true, expiresIn: true }
        });
        if (!tokenData || (0, token_1.isDateExpired)(tokenData?.expiresIn)) {
            return {
                success: false,
                message: "Invalid or expired OTP."
            };
        }
        isValid = await (0, bcrypt_1.compare)(otp, tokenData.value);
    }
    else if (token) {
        const tokenData = await prisma_1.default.token.findUnique({
            where: { userId: id, value: token },
            select: { value: true, expiresIn: true }
        });
        if (!tokenData || (0, token_1.isDateExpired)(tokenData?.expiresIn)) {
            return {
                success: false,
                message: "Invalid or expired OTP."
            };
        }
        isValid = token === tokenData.value;
    }
    if (!isValid) {
        return {
            success: false,
            message: "Invalid or expired OTP."
        };
    }
    await Promise.all([
        prisma_1.default.user.update({
            where: { id },
            data: { verified: true, email: emailToVerify || email }
        }),
        prisma_1.default.token.deleteMany({ where: { userId: id } }),
        prisma_1.default.notification.create({
            data: {
                userId: user.id,
                title: "Email Verified",
                description: "Your email has been verified successfully."
            }
        }),
        (0, email_1.sendTemplateEmail)({
            email: emailToVerify || user.email,
            subject: "Email Verified",
            sections: {
                salutation: `Hello ${user.name}!`,
                message: "Your email has been verified successfully.",
                info: `Please, log in to your account to continue using our services.`,
                cta: (0, button_1.default)(new URL("login", env_1.default.get("APP_URL")).href, "Login", { centered: true })
            },
            mailReason: "You received this email because you completed an email verification process."
        }, generic_1.default)
    ]);
    const payload = {
        success: true,
        message: "Email verified successfully.",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailToVerify: emailToVerify || user.email
        }
    };
    return payload;
}));
