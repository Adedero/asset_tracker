import env from "#src/utils/env";
import { EmailTemplate, RequiredEmailTemplateOptions } from "../email.js";

export interface WelcomeEmailTemplateOptions extends RequiredEmailTemplateOptions {
  user: {
    name: string;
    email: string;
    password: string;
  };
}

const welcome: EmailTemplate<WelcomeEmailTemplateOptions> = (options) => {
  const appUrl = env.get("APP_URL");
  const logoUrl = `${appUrl}/logo.png`;
  const appName = env.get("APP_NAME", "My Assets Tracker");
  const { subject = `Welcome to ${appName}`, user } = options;

  function template() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${subject}</title>
  <style type="text/css">
    /* Basic Reset */
    body, table, td, a { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    /* General Styles */
    body { margin: 0; padding: 0; background-color: #f6f6f6; font-family: Verdana, sans-serif; }
    table { border-collapse: collapse !important; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    a { color: #285BAA; text-decoration: none; } /* Default link color */

    /* Responsive Styles */
    @media screen and (max-width: 600px) {
      .full-width-table { width: 100% !important; }
      .column-width { width: 100% !important; display: block !important; padding-bottom: 20px !important; }
      .mobile-padding { padding: 0 20px !important; }
      .mobile-center { text-align: center !important; }
      .mobile-hide { display: none !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f6f6;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: #222;">
    <tr>
      <td align="center" style="padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="full-width-table" style="max-width: 600px; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <tr>
                  <td align="left" style="padding: 0;">
                    <img src="${logoUrl}" alt="${appName} Logo" width="100" style="display: block; border: 0; max-width: 100px;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 20px; background-color: #222;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding-bottom: 10px;">
                    <p style="font-family: helvetica, sans-serif; font-size: 20px; color: #285BAA; font-weight: 600; margin: 0;">${subject}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <p style="font-family: Verdana, sans-serif; font-size: 14px; color: #FFF; margin: 0;">Dear ${user.name},</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <p style="font-family: Verdana, sans-serif; font-size: 14px; color: #FFF; margin: 0;">
                      Thanks for signing up on ${appName}! We applaud you on taking this important step to making well-informed investments in the digital market. Below are your account details:
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <ul style="font-family: Verdana, sans-serif; font-size: 14px; color: #FFF; margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 5px;">Username: <strong style="word-break: break-all;">${user.email}</strong></li>
                      <li>Password: <strong style="word-break: break-all;">${user.password}</strong></li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <p style="font-family: Verdana, sans-serif; font-size: 14px; color: #FFF; margin: 0;">
                      Please, keep this information safe, especially your password.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 20px;">
                    <p style="font-family: Verdana, sans-serif; font-size: 14px; color: #FFF; margin: 0;">
                      We are excited to have you on board and look forward to helping you achieve your investment goals. If you have any questions or need assistance, please don't hesitate to reach out to us.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 20px; background-color: #222;">
              <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <p style="font-family: Verdana, sans-serif; font-size: 14px; color: #FFF; margin: 0;">
                      Log in to enjoy all the benefits ${appName} has to offer.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0;">
                    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <tr>
                        <td align="center" bgcolor="#285BAA" style="border-radius: 5px;">
                          <a href="${appUrl}/login" target="_blank" style="font-family: helvetica, sans-serif; font-size: 16px; font-weight: bold; color: #FFF; text-decoration: none; padding: 12px 25px; display: inline-block; border-radius: 5px;">
                            Login
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 20px; background-color: #3974D0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding-bottom: 5px;">
                    <p style="font-family: Verdana, sans-serif; font-size: 12px; color: #FFF; margin: 0;">
                      You received this email because you just opened an account with us.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="font-family: Verdana, sans-serif; font-size: 12px; color: #FFF; margin: 0;">
                      ${appName} &copy; ${new Date().getFullYear()} All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
  }

  const html = template();

  return {
    data: { subject, ...options },
    html,
    transporter: "support"
  };
};

export default welcome;
/*
* <mjml>
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
</mjml>
* */
