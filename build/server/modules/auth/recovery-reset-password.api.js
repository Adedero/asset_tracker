"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const bcrypt_1 = require("bcrypt");
const verify_otp_1 = __importDefault(require("./services/verify-otp"));
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const email_1 = require("#src/lib/email/email");
const generic_1 = __importDefault(require("#src/lib/email/mail-templates/generic"));
const zod_1 = require("zod");
const constants_1 = require("#src/utils/constants");
const Schema = zod_1.z.object({
    id: zod_1.z.string({ message: "Invalid user ID" }).optional(),
    email: zod_1.z.string({ message: "Invalid email" }).email({ message: "Invalid email" }).optional(),
    otp: zod_1.z.string({ message: "Invalid OTP" }).length(constants_1.OTP_LENGTH, { message: "Invalid OTP" }),
    password: zod_1.z
        .string({ message: "Inbalid password" })
        .min(constants_1.MIN_PASSWORD_LENGTH, { message: "Password must be at least 8 characters long" })
});
exports.default = (0, api_1.api)({
    group: "/auth",
    path: "/recovery/reset-password",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { id, email, otp, password } = req.validatedBody;
    const result = await (0, verify_otp_1.default)({
        userId: id,
        email,
        otp,
        withVerificationLink: false
    });
    if (!result) {
        throw http_1.HttpException.badRequest("No OTP provided");
    }
    if (!result.valid || !result.user) {
        throw http_1.HttpException.badRequest(result.message);
    }
    const { user } = result;
    if (await (0, bcrypt_1.compare)(password, user.password)) {
        throw http_1.HttpException.badRequest("Your new password cannot be the same as your old password.");
    }
    const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });
    const subject = "Password Reset";
    const message = "Your password has been reset successfully. If you did not initiate this action, contact us immediately.";
    await Promise.all([
        prisma_1.default.notification.create({
            data: {
                userId: user.id,
                title: subject,
                description: message
            }
        }),
        (0, email_1.sendTemplateEmail)({
            email: user.email,
            subject,
            sections: {
                salutation: `Hello ${user.name},`,
                info: message.split(".")[0].trim()
            },
            mailReason: `You received this email because you just reset your password. ${message.split(".")[1].trim()}`
        }, generic_1.default)
    ]);
    const payload = {
        success: true,
        message: "Password reset successfully."
    };
    return payload;
}));
