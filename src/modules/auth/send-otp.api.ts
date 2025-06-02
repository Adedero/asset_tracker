import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { z } from "zod";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { OTP_EXPIRY_TIME } from "#src/utils/constants";
import { randomString, setExpiryDate } from "#src/utils/token";
import { hash } from "bcrypt";
import env from "#src/utils/env";
import { sendTemplateEmail } from "#src/lib/email/email";
import generic from "#src/lib/email/mail-templates/generic";
import button from "#src/lib/email/mail-templates/components/button";
import { ApiResponse } from "#src/types/api-response";

export interface SendOTPApiResponse extends ApiResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  otpEmail: string;
}

const Schema = z.object({
  id: z.string({ message: "User ID is required" }),
  email: z.string({ message: "Email is required" }).email({ message: "Invalid email" }).optional(),
  verification: z
    .object({
      useLink: z.boolean().optional(),
      path: z.string({ message: "Verification path is required" })
    })
    .optional(),
  mailOptions: z
    .object({
      subject: z.string({ message: "Mail subject is required" }),
      buttonLabel: z.string({ message: "Button label is required" }),
      mailReason: z.string({ message: "Mail reason is required" })
    })
    .optional()
});

export default api(
  {
    group: "/auth",
    path: "/otp/send",
    method: "post",
    middleware: defineValidator("body", Schema)
  },
  defineHandler(async (req) => {
    const { id, email, verification, mailOptions } = req.validatedBody as z.infer<typeof Schema>;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      throw HttpException.notFound("Account not found. Please register to continue.");
    }

    await prisma.token.deleteMany({ where: { userId: user.id } });

    const tokenString = randomString(6, "numeric");
    const hashedToken = await hash(tokenString, 10);

    let verificationLink: string = "";

    if (verification?.useLink && verification?.path) {
      verificationLink = new URL(
        `${verification.path}?i=${user.id}&v=${hashedToken}`,
        env.get("APP_URL")
      ).href;
    }

    await prisma.token.create({
      data: {
        userId: user.id,
        value: hashedToken,
        expiresIn: setExpiryDate(OTP_EXPIRY_TIME)
      }
    });

    await sendTemplateEmail(
      {
        subject: mailOptions?.subject || "OTP Verification",
        email: email || user.email,
        sections: {
          salutation: `Hello ${user.name}!`,
          introduction: `Your one-time password is <p style="font-size: 1.65rem; font-weight: 600; color: #285baa">${tokenString}</p>`,
          ...(verification?.useLink && {
            info: `You can also copy and paste the following link into your browser to complete your request: <strong>${verificationLink}</strong> or click the button below.`,
            cta: button(verificationLink, mailOptions?.buttonLabel || "Verify", {
              centered: true
            })
          }),

          note: `The ${verification?.useLink ? "link and " : ""}OTP expires in ${OTP_EXPIRY_TIME}.`
        },
        mailReason:
          mailOptions?.mailReason ||
          "You received this email because you initiated a process that requires an OTP verification."
      },
      generic
    );

    const payload: SendOTPApiResponse = {
      success: true,
      message: "OTP sent successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      otpEmail: email || user.email
    };

    return payload;
  })
);
