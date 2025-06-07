import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { MIN_PASSWORD_LENGTH } from "#src/utils/constants";
import { compare, hash } from "bcrypt";
import { z } from "zod";
import { sendTemplateEmail } from "#src/lib/email/email";
import generic from "#src/lib/email/mail-templates/generic";
import { HttpException } from "#src/lib/api/http";
import env from "#src/utils/env";
const Schema = z.object({
    password: z.string({ message: "Password is required" }).min(MIN_PASSWORD_LENGTH, {
        message: `Password must contain at least ${MIN_PASSWORD_LENGTH} characters.`
    }),
    notify: z.boolean({ message: "Notify option is required" })
});
export default api({
    group: "/admins/me",
    path: "/users/:user_id/reset-password",
    method: "put",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const { user_id } = req.params;
    const { password, notify } = req.validatedBody;
    const user = await prisma.user.findUnique({
        where: { id: user_id },
        select: { id: true, email: true, password: true }
    });
    if (!user) {
        throw HttpException.notFound("User not found");
    }
    if (await compare(password, user.password)) {
        return {
            success: true,
            message: "Password reset successfully"
        };
    }
    const hashedPassword = await hash(password, 10);
    const promises = [
        prisma.user.update({
            where: { id: user_id },
            data: { password: hashedPassword }
        })
    ];
    if (notify) {
        promises.push(sendTemplateEmail({
            email: user.email,
            subject: "Password Reset",
            sections: {
                intro: `Your ${env.get("APP_NAME")} account password has been reset by the site admin.`,
                password: `Your new password is <span style="font-size: 1.75rem"><strong>${password}</strong></span>`
            },
            mailReason: `This email was sent because a modification was made to your ${env.get("APP_NAME")} account.`
        }, generic));
    }
    await Promise.all(promises);
    return {
        success: true,
        message: "Password reset successfully"
    };
}));
