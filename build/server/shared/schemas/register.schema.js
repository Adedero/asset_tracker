"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const RegisterSchema = zod_1.z
    .object({
    name: zod_1.z
        .string({ message: "Full name is required" })
        .min(2, { message: "Full name is required" })
        .trim(),
    email: zod_1.z
        .string({ message: "Email is required" })
        .email({ message: "Please enter a valid email address" })
        .trim(),
    password: zod_1.z
        .string({ message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .trim(),
    passwordConfirm: zod_1.z
        .string({ message: "Password confirmation is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .trim()
})
    .refine((data) => data.passwordConfirm === data.password, {
    message: "Passwords do not match",
    path: ["passwordConfirm"]
});
exports.default = RegisterSchema;
