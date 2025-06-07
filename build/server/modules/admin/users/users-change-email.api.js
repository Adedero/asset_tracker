"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const email_1 = require("#src/lib/email/email");
const generic_1 = __importDefault(require("#src/lib/email/mail-templates/generic"));
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const env_1 = __importDefault(require("#src/utils/env"));
const zod_1 = require("zod");
const Schema = zod_1.z.object({
    email: zod_1.z.string({ required_error: "Email is required" }).email({ message: "Invalid email" }),
    verified: zod_1.z.boolean({ required_error: "Verified option is required" }),
    notify: zod_1.z.boolean({ required_error: "Notify option is required" })
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/users/:user_id/change-email",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { user_id } = req.params;
    const { email, verified, notify } = req.validatedBody;
    const user = await prisma_1.default.user.findUnique({
        where: { id: user_id },
        select: { email: true }
    });
    if (!user) {
        throw http_1.HttpException.notFound("User not found");
    }
    const promises = [
        prisma_1.default.user.update({
            where: { id: user_id },
            data: { email, verified }
        })
    ];
    if (notify) {
        promises.push((0, email_1.sendTemplateEmail)({
            email,
            subject: "Change of Email",
            sections: {
                intro: `The email associated with your ${env_1.default.get("APP_NAME")} account was changed by the site admin.`,
                detail: `Your old email is: ${user.email}.\nYour new email is: ${email}.</p>`
            },
            mailReason: `This email was sent because a modification was made to your ${env_1.default.get("APP_NAME")} account.`
        }, generic_1.default));
    }
    await Promise.all(promises);
    return {
        success: true,
        message: "User email updated successfully"
    };
}));
