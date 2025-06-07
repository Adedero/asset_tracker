import { alertEmitter } from "#src/events/alert.event";
import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import changePassword from "#src/modules/auth/services/change-password";
import { MIN_PASSWORD_LENGTH } from "#src/utils/constants";
import { z } from "zod";
const Schema = z
    .object({
    oldPassword: z.string({ message: "Old password is required" }).min(MIN_PASSWORD_LENGTH, {
        message: `Old password must contain at least ${MIN_PASSWORD_LENGTH} characters`
    }),
    newPassword: z.string({ message: "New password is required" }).min(MIN_PASSWORD_LENGTH, {
        message: `New password must contain at least ${MIN_PASSWORD_LENGTH} characters`
    }),
    newPasswordConfirm: z
        .string({ message: "Confirm password is required" })
        .min(MIN_PASSWORD_LENGTH, {
        message: `Confirm password must contain at least ${MIN_PASSWORD_LENGTH} characters`
    })
})
    .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Passwords do not match",
    path: ["newPasswordConfirm"]
});
export default api({
    group: "/admins/me",
    path: "password/change",
    method: "put",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const data = req.validatedBody;
    const userId = req.user.id;
    const result = await changePassword(userId, data);
    if (!result.success) {
        throw HttpException.badRequest(result.message);
    }
    alertEmitter.emit("password:change", { user: req.user });
    return {
        success: true,
        message: "Password changed successfully"
    };
}));
