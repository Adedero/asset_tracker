import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import { compare, hash } from "bcrypt";
import verifyOTP from "./services/verify-otp.js";
import prisma from "#src/lib/prisma/prisma";
import { sendTemplateEmail } from "#src/lib/email/email";
import generic from "#src/lib/email/mail-templates/generic";
import { z } from "zod";
import { OTP_LENGTH, MIN_PASSWORD_LENGTH } from "#src/utils/constants";
const Schema = z.object({
    id: z.string({ message: "Invalid user ID" }).optional(),
    email: z.string({ message: "Invalid email" }).email({ message: "Invalid email" }).optional(),
    otp: z.string({ message: "Invalid OTP" }).length(OTP_LENGTH, { message: "Invalid OTP" }),
    password: z
        .string({ message: "Inbalid password" })
        .min(MIN_PASSWORD_LENGTH, { message: "Password must be at least 8 characters long" })
});
export default api({
    group: "/auth",
    path: "/recovery/reset-password",
    method: "post",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const { id, email, otp, password } = req.validatedBody;
    const result = await verifyOTP({
        userId: id,
        email,
        otp,
        withVerificationLink: false
    });
    if (!result) {
        throw HttpException.badRequest("No OTP provided");
    }
    if (!result.valid || !result.user) {
        throw HttpException.badRequest(result.message);
    }
    const { user } = result;
    if (await compare(password, user.password)) {
        throw HttpException.badRequest("Your new password cannot be the same as your old password.");
    }
    const hashedPassword = await hash(password, 10);
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });
    const subject = "Password Reset";
    const message = "Your password has been reset successfully. If you did not initiate this action, contact us immediately.";
    await Promise.all([
        prisma.notification.create({
            data: {
                userId: user.id,
                title: subject,
                description: message
            }
        }),
        sendTemplateEmail({
            email: user.email,
            subject,
            sections: {
                salutation: `Hello ${user.name},`,
                info: message.split(".")[0].trim()
            },
            mailReason: `You received this email because you just reset your password. ${message.split(".")[1].trim()}`
        }, generic)
    ]);
    const payload = {
        success: true,
        message: "Password reset successfully."
    };
    return payload;
}));
