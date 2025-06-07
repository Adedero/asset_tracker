import mailTransporters from "#src/config/nodemailer.config";
export default function sendEmail(options, transporter) {
    return new Promise((resolve, reject) => {
        (transporter || mailTransporters.support.transporter()).sendMail(options, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
}
export async function sendTemplateEmail(options, template) {
    const { data, html, transporter: key } = template(options);
    const { config, transporter } = mailTransporters[key || "support"];
    const info = await sendEmail({
        from: config.auth?.user,
        to: data.email,
        subject: data.subject,
        html
    }, transporter());
    return info;
}
