"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const LoginSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "Email is required" })
        .email({ message: "Please enter a valid email address" })
        .trim(),
    password: zod_1.z
        .string({ message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .trim()
});
exports.default = LoginSchema;
