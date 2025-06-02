import mailTransporters from "#src/config/nodemailer.config";
import env from "#src/utils/env";
import { EmailTemplate, RequiredEmailTemplateOptions } from "../email";
import mjml2html from "mjml";
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

const appName = env.get("APP_NAME", "Asset Tracker");

const generic: EmailTemplate<GenericEmailTemplateOptions> = (options) => {
  const { subject = appName, sections, mailReason, transporter } = options;

  function template() {
    return `
      <mjml>
        <mj-body>
          <mj-section background-color="#222">
            <mj-column>
              <mj-image align="left" width="100px" src="${env.get("APP_URL")}/logo.png"></mj-image>
            </mj-column>
          </mj-section>


          <mj-section background-color="#222">
            <mj-column>
              <mj-text align="center" font-size="20px" color="#285BAA" font-weight="600" font-family="helvetica">${subject}</mj-text>
            </mj-column>
          </mj-section>

          ${
            sections
              ? `
          ${Object.values(sections)
            .map(
              (section) => `
            <mj-section background-color="#222">
              <mj-column>
                ${render(section)}
              </mj-column>
            </mj-section>`
            )
            .join("")}`
              : ""
          }

          <mj-section background-color="#3974D0">
            <mj-column>
              ${
                mailReason
                  ? `<mj-text color="#FFF" font-size="12px" font-family="Verdana" align="center">
                ${mailReason}
              </mj-text>`
                  : ""
              }

              <mj-text color="#FFF" font-size="12px" font-family="Verdana" align="center">
                ${appName} &copy; ${new Date().getFullYear()} All rights reserved.
              </mj-text>
            </mj-column>
          </mj-section>

        </mj-body>
      </mjml>
    `;
  }

  const { html } = mjml2html(template());

  return {
    data: options,
    html,
    transporter
  };
};

export default generic;
