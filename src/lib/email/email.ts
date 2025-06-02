import { SendMailOptions, Transporter } from "nodemailer";
import mailTransporters from "#src/config/nodemailer.config";

export default function sendEmail(options: SendMailOptions, transporter?: Transporter) {
  return new Promise<any>((resolve, reject) => {
    (transporter || mailTransporters.support.transporter()).sendMail(options, (error, info) => {
      if (error) {
        return reject(error);
      }
      resolve(info);
    });
  });
}

export interface RequiredEmailTemplateOptions {
  subject?: string;
  email: string;
}

export type EmailTemplate<T extends RequiredEmailTemplateOptions> = (options: T) => {
  transporter?: keyof typeof mailTransporters;
  data: T;
  html: string;
};

export async function sendTemplateEmail<T extends RequiredEmailTemplateOptions>(
  options: T,
  template: EmailTemplate<T>
) {
  const { data, html, transporter: key } = template(options);

  const { config, transporter } = mailTransporters[key || "support"];

  const info = await sendEmail(
    {
      from: config.auth?.user,
      to: data.email,
      subject: data.subject,
      html
    },
    transporter()
  );

  return info;
}
