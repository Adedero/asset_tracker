"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const email_data_1 = require("#src/shared/schemas/email-data");
const nodemailer_config_1 = __importDefault(require("#src/config/nodemailer.config"));
const http_1 = require("#src/lib/api/http");
const helpers_1 = require("#src/lib/email/mail-templates/utils/helpers");
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/send-mail",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", email_data_1.EmailDataSchema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const data = req.validatedBody;
    const transporter = Object.values(nodemailer_config_1.default)
        .find(({ config }) => config.auth?.user === data.from.address)
        ?.transporter();
    if (!transporter) {
        throw http_1.HttpException.badRequest("The sender email provided is not authenticated. Please, use a different address");
    }
    data.html = (0, helpers_1.formatMailHTMLContent)(data.html, data.subject);
    //@ts-ignore
    await transporter.sendMail(data);
    return {
        success: true,
        message: "Email sent successfully"
    };
}));
