import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { sendTemplateEmail } from "#src/lib/email/email";
import button from "#src/lib/email/mail-templates/components/button";
import generic from "#src/lib/email/mail-templates/generic";
import prisma from "#src/lib/prisma/prisma";
import { OTP_LENGTH } from "#src/utils/constants";
import env from "#src/utils/env";
import { isDateExpired } from "#src/utils/token";
import { compare } from "bcrypt";
import { z } from "zod";
const Schema = z.object({
    email: z.string({ message: "Email is required" }).email({ message: "Invalid email" }).optional(),
    emailToVerify: z.string().email({ message: "Invalid email to verify" }).optional(),
    otp: z
        .string({ message: "Invalid OTP" })
        .length(OTP_LENGTH, { message: "Invalid OTP" })
        .optional(),
    token: z.string({ message: "Invalid token" }).optional(),
    id: z.string({ message: "Invalid id" }).optional()
});
export default api({
    group: "/auth",
    path: "/verification/verify-email",
    method: "post",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const { otp, token, email, emailToVerify, id } = req.validatedBody;
    let query = null;
    if (id) {
        query = { id, ...(query || {}) };
    }
    if (email) {
        query = { email, ...(query || {}) };
    }
    if (!query) {
        return {
            success: false,
            message: "Invalid request. Please try again."
        };
    }
    const user = await prisma.user.findUnique({
        where: query,
        select: { id: true, name: true, email: true, verified: true }
    });
    if (!user) {
        return {
            success: false,
            message: "Account not found. Please register to continue."
        };
    }
    if (user.verified && email === emailToVerify) {
        return {
            success: true,
            message: "Email verified successfully.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }
    let isValid = false;
    if (otp) {
        const tokenData = await prisma.token.findUnique({
            where: { userId: id },
            select: { value: true, expiresIn: true }
        });
        if (!tokenData || isDateExpired(tokenData?.expiresIn)) {
            return {
                success: false,
                message: "Invalid or expired OTP."
            };
        }
        isValid = await compare(otp, tokenData.value);
    }
    else if (token) {
        const tokenData = await prisma.token.findUnique({
            where: { userId: id, value: token },
            select: { value: true, expiresIn: true }
        });
        if (!tokenData || isDateExpired(tokenData?.expiresIn)) {
            return {
                success: false,
                message: "Invalid or expired OTP."
            };
        }
        isValid = token === tokenData.value;
    }
    if (!isValid) {
        return {
            success: false,
            message: "Invalid or expired OTP."
        };
    }
    await Promise.all([
        prisma.user.update({
            where: { id },
            data: { verified: true, email: emailToVerify || email }
        }),
        prisma.token.deleteMany({ where: { userId: id } }),
        prisma.notification.create({
            data: {
                userId: user.id,
                title: "Email Verified",
                description: "Your email has been verified successfully."
            }
        }),
        sendTemplateEmail({
            email: emailToVerify || user.email,
            subject: "Email Verified",
            sections: {
                salutation: `Hello ${user.name}!`,
                message: "Your email has been verified successfully.",
                info: `Please, log in to your account to continue using our services.`,
                cta: button(new URL("login", env.get("APP_URL")).href, "Login", { centered: true })
            },
            mailReason: "You received this email because you completed an email verification process."
        }, generic)
    ]);
    const payload = {
        success: true,
        message: "Email verified successfully.",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailToVerify: emailToVerify || user.email
        }
    };
    return payload;
}));
