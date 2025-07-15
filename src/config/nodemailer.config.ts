import { createTransport, Transporter } from "nodemailer";
import env from "#src/utils/env";
import SMTPTransport from "nodemailer/lib/smtp-transport";

interface TransporterObject {
  config: SMTPTransport.Options;
  transporter: () => Transporter;
}

const supportTransportConfig: SMTPTransport.Options = {
  host: env.get("SUPPORT_EMAIL_HOST"),
  port: 465,
  secure: true,
  auth: {
    user: env.get("SUPPORT_EMAIL_USER"),
    pass: env.get("SUPPORT_EMAIL_PASSWORD")
  }
};

const financeTransportConfig: SMTPTransport.Options = {
  host: env.get("FINANCE_EMAIL_HOST"),
  port: 465,
  secure: true,
  auth: {
    user: env.get("FINANCE_EMAIL_USER"),
    pass: env.get("FINANCE_EMAIL_PASSWORD")
  }
};

export type MailTransporters = Record<string, TransporterObject>;

const mailTransporters: MailTransporters = {
  support: {
    config: supportTransportConfig,
    transporter: () => createTransport(supportTransportConfig)
  },
  finance: {
    config: financeTransportConfig,
    transporter: () => createTransport(financeTransportConfig)
  }
};

export default mailTransporters;
