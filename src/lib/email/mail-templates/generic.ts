import mailTransporters from "#src/config/nodemailer.config";
import env from "#src/utils/env";
import { EmailTemplate, RequiredEmailTemplateOptions } from "../email.js";
import { render } from "./utils/helpers.js";

export interface GenericEmailTemplateOptions extends RequiredEmailTemplateOptions {
  transporter?: keyof typeof mailTransporters;
  sections?: {
    [key: string]: any;
  };
  mailReason?: string;
  user?: {
    name?: string;
    email?: string;
  };
}

const generic: EmailTemplate<GenericEmailTemplateOptions> = (options) => {
  const appName = env.get("APP_NAME", "Asset Tracker");

  const { subject = appName, sections, mailReason, transporter } = options;

  function template() {
    return `
<html lang="en">
  <head>
    <title>${subject}</title>
    <style>
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }
    </style>
  </head>

  <body style="width: 100%; max-width: 100%; padding: 0.8rem">
    <main style="border: 1px solid #aaa; border-radius: 5px; padding: 0.8rem">
      <header>
        <div style="background-color: #eee; width: 32px; height: 32px; border-radius: 5px; overflow: hidden">
          <img src="${env.get("APP_URL")}/logo.png" style="width: 100%; height: 100%; object-fit: cover" alt="logo" />
        </div>

        <div style="margin-top: 1rem; color: #3974d0;">
          <h1 style="font-weight: 600; font-size: 22px">${subject || "(no subject)"}</h1>
        </div>
      </header>

      ${
        sections
          ? `${Object.values(sections)
              .map((section) => `<div style="margin-top: 1.25rem"> ${render(section)}</div>`)
              .join("\n")}`
          : ""
      }

      <footer style="padding: 0.8rem 1rem; margin-top: 2rem; background-color: #3974D0; border-radius: 5px; color: white; text-align: center; font-size: 12px">
        ${mailReason ? `<p style="margin-bottom: 0.25rem">${mailReason}</p>` : ""}
        <p>${appName} &copy; ${new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </main>
  </body>
</html>`;
  }

  const html = template();

  return {
    data: options,
    html,
    transporter
  };
};

export default generic;
