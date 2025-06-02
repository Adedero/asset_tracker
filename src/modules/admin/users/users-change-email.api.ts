import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import { sendTemplateEmail } from "#src/lib/email/email";
import generic from "#src/lib/email/mail-templates/generic";
import prisma from "#src/lib/prisma/prisma";
import env from "#src/utils/env";
import { z } from "zod";

const Schema = z.object({
  email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email" }),
  verified: z.boolean({ required_error: "Verified option is required" }),
  notify: z.boolean({ required_error: "Notify option is required" })
});

export default api(
  {
    group: "/admins/me",
    path: "/users/:user_id/change-email",
    method: "put",
    middleware: defineValidator("body", Schema)
  },
  defineHandler(async (req) => {
    const { user_id } = req.params;
    const { email, verified, notify } = req.validatedBody as z.infer<typeof Schema>;

    const user = await prisma.user.findUnique({
      where: { id: user_id },
      select: { email: true }
    });

    if (!user) {
      throw HttpException.notFound("User not found");
    }

    const promises: any[] = [
      prisma.user.update({
        where: { id: user_id },
        data: { email, verified }
      })
    ];

    if (notify) {
      promises.push(
        sendTemplateEmail(
          {
            email,
            subject: "Change of Email",
            sections: {
              intro: `The email associated with your ${env.get("APP_NAME")} account was changed by the site admin.`,
              detail: `Your old email is: ${user.email}.\nYour new email is: ${email}.</p>`
            },
            mailReason: `This email was sent because a modification was made to your ${env.get("APP_NAME")} account.`
          },
          generic
        )
      );
    }

    await Promise.all(promises);

    return {
      success: true,
      message: "User email updated successfully"
    };
  })
);
