"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = require("nodemailer");
const env_1 = __importDefault(require("#src/utils/env"));
const supportTransportConfig = {
    host: env_1.default.get("SUPPORT_EMAIL_HOST"),
    port: 465,
    secure: true,
    auth: {
        user: env_1.default.get("SUPPORT_EMAIL_USER"),
        pass: env_1.default.get("SUPPORT_EMAIL_PASSWORD")
    }
};
const mailTransporters = {
    support: {
        config: supportTransportConfig,
        transporter: () => (0, nodemailer_1.createTransport)(supportTransportConfig)
    }
};
exports.default = mailTransporters;
