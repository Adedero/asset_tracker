import env from "#src/utils/env";
import mjml2html from "mjml";
import { EmailTemplate, RequiredEmailTemplateOptions } from "../email.js";

export interface WelcomeEmailTemplateOptions extends RequiredEmailTemplateOptions {
  user: {
    name: string;
    email: string;
    password: string;
  };
}

const appName = env.get("APP_NAME", "Asset Tracker");

const welcome: EmailTemplate<WelcomeEmailTemplateOptions> = (options) => {
  const { subject = `Welcome to ${appName}`, user } = options;

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

        <mj-text color="#FFF" font-family="Verdana">Dear ${user.name},</mj-text>

        <mj-text color="#FFF" font-family="Verdana">
          Thanks for signing up on ${appName}.! We applaud you on taking this important step to making well-informed investments in the digital market. Below are your account details:
        </mj-text>

        <mj-text color="#FFF" font-family="Verdana">
          <ul>
            <li>Username: ${user.email}</li>
            <li>Password: ${user.password}</li>
          </ul>
        <mj-text>

        <mj-text color="#FFF" font-family="Verdana">
          Please, keep this information safe, especially your password.
        </mj-text>
        <br /><br />
        <mj-text color="#FFF" font-family="Verdana">
          We are excited to have you on board and look forward to helping you achieve your investment goals. If you have any questions or need assistance, please don't hesitate to reach out to us.
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#222">
      <mj-column>
        <mj-text color="#FFF" font-family="Verdana" align="center">
          Log in to enjoy all the benefits Invest Tracker has to offer.
        </mj-text>

        <mj-button background-color="#285BAA" color="#FFF" href="${env.get("APP_URL")}/login" font-family="helvetica">Login</mj-button>
      </mj-column>
    </mj-section>

    <mj-section background-color="#3974D0">
      <mj-column>
        <mj-text color="#FFF" font-size="12px" font-family="Verdana" align="center">
          You received this email because you just opened an account with us.
        </mj-text>

        <mj-text color="#FFF" font-size="12px" font-family="Verdana" align="center">
          ${appName} &copy; ${new Date().getFullYear()} All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
  }

  const { html } = mjml2html(template());

  return {
    data: { subject, ...options },
    html,
    transporter: "support"
  };
};

export default welcome;
