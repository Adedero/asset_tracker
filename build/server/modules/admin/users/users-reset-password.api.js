"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const constants_1 = require("#src/utils/constants");
const bcrypt_1 = require("bcrypt");
const zod_1 = require("zod");
const email_1 = require("#src/lib/email/email");
const generic_1 = __importDefault(require("#src/lib/email/mail-templates/generic"));
const http_1 = require("#src/lib/api/http");
const env_1 = __importDefault(require("#src/utils/env"));
const Schema = zod_1.z.object({
    password: zod_1.z.string({ message: "Password is required" }).min(constants_1.MIN_PASSWORD_LENGTH, {
        message: `Password must contain at least ${constants_1.MIN_PASSWORD_LENGTH} characters.`
    }),
    notify: zod_1.z.boolean({ message: "Notify option is required" })
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/users/:user_id/reset-password",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { user_id } = req.params;
    const { password, notify } = req.validatedBody;
    const user = await prisma_1.default.user.findUnique({
        where: { id: user_id },
        select: { id: true, email: true, password: true }
    });
    if (!user) {
        throw http_1.HttpException.notFound("User not found");
    }
    if (await (0, bcrypt_1.compare)(password, user.password)) {
        return {
            success: true,
            message: "Password reset successfully"
        };
    }
    const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
    const promises = [
        prisma_1.default.user.update({
            where: { id: user_id },
            data: { password: hashedPassword }
        })
    ];
    if (notify) {
        promises.push((0, email_1.sendTemplateEmail)({
            email: user.email,
            subject: "Password Reset",
            sections: {
                intro: `Your ${env_1.default.get("APP_NAME")} account password has been reset by the site admin.`,
                password: `Your new password is <span style="font-size: 1.75rem"><strong>${password}</strong></span>`
            },
            mailReason: `This email was sent because a modification was made to your ${env_1.default.get("APP_NAME")} account.`
        }, generic_1.default));
    }
    await Promise.all(promises);
    return {
        success: true,
        message: "Password reset successfully"
    };
}));
