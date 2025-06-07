import { api } from "#src/lib/api/api";
import RegisterSchema from "#src/shared/schemas/register.schema";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { hash } from "bcrypt";
import { sendTemplateEmail } from "#src/lib/email/email";
import welcome from "#src/lib/email/mail-templates/welcome";
import generic from "#src/lib/email/mail-templates/generic";
import env from "#src/utils/env";
import { format } from "date-fns";
export default api({
    group: "/auth",
    path: "/register",
    method: "post",
    middleware: defineValidator("body", RegisterSchema)
}, defineHandler(async (req) => {
    const { name, email, password } = req.validatedBody;
    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true }
    });
    if (existingUser) {
        throw HttpException.badRequest("Email already exists. Sign in instead or use a different email.");
    }
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: "USER",
            account: {
                create: {
                    walletBalance: 0
                }
            }
        },
        select: {
            id: true,
            name: true,
            email: true,
            verified: true,
            role: true
        }
    });
    const payload = {
        success: true,
        message: "Registration completed successfully",
        user
    };
    await Promise.all([
        sendTemplateEmail({ email, user: { name, email, password } }, welcome),
        sendTemplateEmail({
            email: env.get("SUPPORT_EMAIL_USER"),
            subject: "New User Registration",
            sections: {
                salutation: `Dear, ${env.get("APP_NAME", "My Assets Tracker")} Admin`,
                introduction: `A new user has registered on ${env.get("APP_NAME", "My Assets Tracker")}.`,
                details: {
                    Name: name,
                    Email: email,
                    Date: format(new Date(), "dd MMM, yyyy hh:mm aaaa")
                }
            }
        }, generic)
    ]);
    return payload;
}));
