"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const alert_event_1 = require("#src/events/alert.event");
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const change_password_1 = __importDefault(require("#src/modules/auth/services/change-password"));
const constants_1 = require("#src/utils/constants");
const zod_1 = require("zod");
const Schema = zod_1.z
    .object({
    oldPassword: zod_1.z.string({ message: "Old password is required" }).min(constants_1.MIN_PASSWORD_LENGTH, {
        message: `Old password must contain at least ${constants_1.MIN_PASSWORD_LENGTH} characters`
    }),
    newPassword: zod_1.z.string({ message: "New password is required" }).min(constants_1.MIN_PASSWORD_LENGTH, {
        message: `New password must contain at least ${constants_1.MIN_PASSWORD_LENGTH} characters`
    }),
    newPasswordConfirm: zod_1.z
        .string({ message: "Confirm password is required" })
        .min(constants_1.MIN_PASSWORD_LENGTH, {
        message: `Confirm password must contain at least ${constants_1.MIN_PASSWORD_LENGTH} characters`
    })
})
    .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Passwords do not match",
    path: ["newPasswordConfirm"]
});
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "password/change",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const data = req.validatedBody;
    const userId = req.user.id;
    const result = await (0, change_password_1.default)(userId, data);
    if (!result.success) {
        throw http_1.HttpException.badRequest(result.message);
    }
    alert_event_1.alertEmitter.emit("password:change", { user: req.user });
    return {
        success: true,
        message: "Password changed successfully"
    };
}));
