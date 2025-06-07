"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const register_schema_1 = __importDefault(require("#src/shared/schemas/register.schema"));
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const bcrypt_1 = require("bcrypt");
const email_1 = require("#src/lib/email/email");
const welcome_1 = __importDefault(require("#src/lib/email/mail-templates/welcome"));
const generic_1 = __importDefault(require("#src/lib/email/mail-templates/generic"));
const env_1 = __importDefault(require("#src/utils/env"));
const date_fns_1 = require("date-fns");
exports.default = (0, api_1.api)({
    group: "/auth",
    path: "/register",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", register_schema_1.default)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { name, email, password } = req.validatedBody;
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email },
        select: { id: true, email: true }
    });
    if (existingUser) {
        throw http_1.HttpException.badRequest("Email already exists. Sign in instead or use a different email.");
    }
    const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
    const user = await prisma_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: "USER",
            account: {
                create: {
                    walletBalance: 0
                }
            }
        },
        select: {
            id: true,
            name: true,
            email: true,
            verified: true,
            role: true
        }
    });
    const payload = {
        success: true,
        message: "Registration completed successfully",
        user
    };
    await Promise.all([
        (0, email_1.sendTemplateEmail)({ email, user: { name, email, password } }, welcome_1.default),
        (0, email_1.sendTemplateEmail)({
            email: env_1.default.get("SUPPORT_EMAIL_USER"),
            subject: "New User Registration",
            sections: {
                salutation: `Dear, ${env_1.default.get("APP_NAME", "My Assets Tracker")} Admin`,
                introduction: `A new user has registered on ${env_1.default.get("APP_NAME", "My Assets Tracker")}.`,
                details: {
                    Name: name,
                    Email: email,
                    Date: (0, date_fns_1.format)(new Date(), "dd MMM, yyyy hh:mm aaaa")
                }
            }
        }, generic_1.default)
    ]);
    return payload;
}));
