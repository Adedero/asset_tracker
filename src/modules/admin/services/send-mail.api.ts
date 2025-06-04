import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { EmailData, EmailDataSchema } from "#src/shared/schemas/email-data";
import { ApiResponse } from "#src/types/api-response";
import mailTransporters from "#src/config/nodemailer.config";
import { HttpException } from "#src/lib/api/http";
import { formatMailHTMLContent } from "#src/lib/email/mail-templates/utils/helpers";

export default api(
  {
    group: "/admins/me",
    path: "/send-mail",
    method: "post",
    middleware: defineValidator("body", EmailDataSchema)
  },
  defineHandler<ApiResponse>(async (req) => {
    const data = req.validatedBody as EmailData;

    const transporter = Object.values(mailTransporters)
      .find(({ config }) => config.auth?.user === data.from.address)
      ?.transporter();

    if (!transporter) {
      throw HttpException.badRequest(
        "The sender email provided is not authenticated. Please, use a different address"
      );
    }

    data.html = formatMailHTMLContent(data.html, data.subject);

    //@ts-ignore
    await transporter.sendMail(data);

    return {
      success: true,
      message: "Email sent successfully"
    };
  })
);
