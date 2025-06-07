"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPasswordChange = onPasswordChange;
const email_1 = require("#src/lib/email/email");
const generic_1 = __importDefault(require("#src/lib/email/mail-templates/generic"));
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const logger_1 = __importDefault(require("#src/utils/logger"));
async function onPasswordChange({ user }) {
    const subject = "Change of Password";
    const sections = {
        greeting: `Hello ${user.name}!`,
        info: "Your password has been changed successfully.",
        note: "If you did not initiate this change, please contact support immediately as your account may have been compromised."
    };
    const mailReason = "This email was sent because your password was changed.";
    try {
        await Promise.all([
            prisma_1.default.notification.create({
                data: {
                    userId: user.id,
                    title: subject,
                    description: sections.info
                }
            }),
            (0, email_1.sendTemplateEmail)({
                email: user.email,
                subject,
                mailReason,
                sections
            }, generic_1.default)
        ]);
    }
    catch (error) {
        logger_1.default.error(`Alerts failed for password change: ${user.id}`, error);
    }
}
