import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { OTP_EXPIRY_TIME, OTP_LENGTH } from "#src/utils/constants";
import { randomString, setExpiryDate } from "#src/utils/token";
import { hash } from "bcrypt";
import { z } from "zod";
import env from "#src/utils/env";
import { sendTemplateEmail } from "#src/lib/email/email";
import generic from "#src/lib/email/mail-templates/generic";
import button from "#src/lib/email/mail-templates/components/button";
const Schema = z.object({
    userId: z.string({ message: "invalid ID format" }).optional(),
    email: z.string({ message: "Email is required" }).email({ message: "Invalid email" }),
    emailToVerify: z.string().email({ message: "Invalid email to verify" }).optional()
});
export default api({
    group: "/auth",
    path: "/verification/send-email",
    method: "post",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const { userId, email, emailToVerify } = req.validatedBody;
    let query = {
        email
    };
    if (userId) {
        query = { id: userId, ...query };
    }
    const user = await prisma.user.findUnique({
        where: query,
        select: { id: true, name: true, email: true }
    });
    if (!user) {
        throw HttpException.notFound("Account not found. Please register to continue.");
    }
    await prisma.token.deleteMany({ where: { userId: user.id } });
    const tokenString = randomString(OTP_LENGTH, "numeric");
    const hashedToken = await hash(tokenString, 10);
    const verificationLink = new URL(`email-verification?i=${user.id}&v=${hashedToken}`, env.get("APP_URL")).href;
    await prisma.token.create({
        data: {
            userId: user.id,
            value: hashedToken,
            expiresIn: setExpiryDate(OTP_EXPIRY_TIME)
        }
    });
    await sendTemplateEmail({
        subject: "Email Verification",
        email: emailToVerify || user.email,
        sections: {
            salutation: `Hello ${user.name}!`,
            introduction: `Your one-time password is <p style="font-size: 1.65rem; font-weight: 600; color: #285baa">${tokenString}</p>`,
            info: `You can also copy and paste the following link into your browser to complete your request: <strong>${verificationLink}</strong> or click the button below.`,
            cta: button(verificationLink, "Verify Email", {
                centered: true
            }),
            note: `The link and OTP expires in ${OTP_EXPIRY_TIME}.`
        },
        mailReason: "You received this email because you requested a verification of your email."
    }, generic);
    const payload = {
        success: true,
        message: "Verification email sent successfully",
        id: user.id,
        email: user.email,
        name: user.name,
        emailToVerify: emailToVerify || user.email
    };
    return payload;
}));
