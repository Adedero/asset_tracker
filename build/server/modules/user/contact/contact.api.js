import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { sendTemplateEmail } from "#src/lib/email/email";
import generic from "#src/lib/email/mail-templates/generic";
import env from "#src/utils/env";
import { z } from "zod";
const Schema = z.object({
    subject: z.string({ message: "Invalid email subject" }).optional(),
    message: z.string({ message: "Message is required" })
});
export default api({
    group: "/users/me",
    path: "contact",
    method: "post",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const { subject, message } = req.validatedBody;
    await sendTemplateEmail({
        email: env.get("SUPPORT_EMAIL_USER"),
        subject: "Support Request",
        sections: {
            intro: "You have received a support request",
            details: {
                Name: req.user.name,
                Email: req.user.email,
                Subject: subject,
                Message: message
            }
        }
    }, generic);
    return {
        success: true,
        message: "Email sent successfully"
    };
}));
