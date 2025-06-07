"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sendEmail;
exports.sendTemplateEmail = sendTemplateEmail;
const nodemailer_config_1 = __importDefault(require("#src/config/nodemailer.config"));
function sendEmail(options, transporter) {
    return new Promise((resolve, reject) => {
        (transporter || nodemailer_config_1.default.support.transporter()).sendMail(options, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
}
async function sendTemplateEmail(options, template) {
    const { data, html, transporter: key } = template(options);
    const { config, transporter } = nodemailer_config_1.default[key || "support"];
    const info = await sendEmail({
        from: config.auth?.user,
        to: data.email,
        subject: data.subject,
        html
    }, transporter());
    return info;
}
