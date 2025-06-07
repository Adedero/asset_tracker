import { createTransport } from "nodemailer";
import env from "#src/utils/env";
const supportTransportConfig = {
    host: env.get("SUPPORT_EMAIL_HOST"),
    port: 465,
    secure: true,
    auth: {
        user: env.get("SUPPORT_EMAIL_USER"),
        pass: env.get("SUPPORT_EMAIL_PASSWORD")
    }
};
const mailTransporters = {
    support: {
        config: supportTransportConfig,
        transporter: () => createTransport(supportTransportConfig)
    }
};
export default mailTransporters;
