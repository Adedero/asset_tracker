"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const email_1 = require("#src/lib/email/email");
const generic_1 = __importDefault(require("#src/lib/email/mail-templates/generic"));
const env_1 = __importDefault(require("#src/utils/env"));
const zod_1 = require("zod");
const Schema = zod_1.z.object({
    subject: zod_1.z.string({ message: "Invalid email subject" }).optional(),
    message: zod_1.z.string({ message: "Message is required" })
});
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "contact",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { subject, message } = req.validatedBody;
    await (0, email_1.sendTemplateEmail)({
        email: env_1.default.get("SUPPORT_EMAIL_USER"),
        subject: "Support Request",
        sections: {
            intro: "You have received a support request",
            details: {
                Name: req.user.name,
                Email: req.user.email,
                Subject: subject,
                Message: message
            }
        }
    }, generic_1.default);
    return {
        success: true,
        message: "Email sent successfully"
    };
}));
