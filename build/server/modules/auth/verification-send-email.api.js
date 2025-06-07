"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const constants_1 = require("#src/utils/constants");
const token_1 = require("#src/utils/token");
const bcrypt_1 = require("bcrypt");
const zod_1 = require("zod");
const env_1 = __importDefault(require("#src/utils/env"));
const email_1 = require("#src/lib/email/email");
const generic_1 = __importDefault(require("#src/lib/email/mail-templates/generic"));
const button_1 = __importDefault(require("#src/lib/email/mail-templates/components/button"));
const Schema = zod_1.z.object({
    userId: zod_1.z.string({ message: "invalid ID format" }).optional(),
    email: zod_1.z.string({ message: "Email is required" }).email({ message: "Invalid email" }),
    emailToVerify: zod_1.z.string().email({ message: "Invalid email to verify" }).optional()
});
exports.default = (0, api_1.api)({
    group: "/auth",
    path: "/verification/send-email",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { userId, email, emailToVerify } = req.validatedBody;
    let query = {
        email
    };
    if (userId) {
        query = { id: userId, ...query };
    }
    const user = await prisma_1.default.user.findUnique({
        where: query,
        select: { id: true, name: true, email: true }
    });
    if (!user) {
        throw http_1.HttpException.notFound("Account not found. Please register to continue.");
    }
    await prisma_1.default.token.deleteMany({ where: { userId: user.id } });
    const tokenString = (0, token_1.randomString)(constants_1.OTP_LENGTH, "numeric");
    const hashedToken = await (0, bcrypt_1.hash)(tokenString, 10);
    const verificationLink = new URL(`email-verification?i=${user.id}&v=${hashedToken}`, env_1.default.get("APP_URL")).href;
    await prisma_1.default.token.create({
        data: {
            userId: user.id,
            value: hashedToken,
            expiresIn: (0, token_1.setExpiryDate)(constants_1.OTP_EXPIRY_TIME)
        }
    });
    await (0, email_1.sendTemplateEmail)({
        subject: "Email Verification",
        email: emailToVerify || user.email,
        sections: {
            salutation: `Hello ${user.name}!`,
            introduction: `Your one-time password is <p style="font-size: 1.65rem; font-weight: 600; color: #285baa">${tokenString}</p>`,
            info: `You can also copy and paste the following link into your browser to complete your request: <strong>${verificationLink}</strong> or click the button below.`,
            cta: (0, button_1.default)(verificationLink, "Verify Email", {
                centered: true
            }),
            note: `The link and OTP expires in ${constants_1.OTP_EXPIRY_TIME}.`
        },
        mailReason: "You received this email because you requested a verification of your email."
    }, generic_1.default);
    const payload = {
        success: true,
        message: "Verification email sent successfully",
        id: user.id,
        email: user.email,
        name: user.name,
        emailToVerify: emailToVerify || user.email
    };
    return payload;
}));
