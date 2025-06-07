import { z } from "zod";
const RegisterSchema = z
    .object({
    name: z
        .string({ message: "Full name is required" })
        .min(2, { message: "Full name is required" })
        .trim(),
    email: z
        .string({ message: "Email is required" })
        .email({ message: "Please enter a valid email address" })
        .trim(),
    password: z
        .string({ message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .trim(),
    passwordConfirm: z
        .string({ message: "Password confirmation is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .trim()
})
    .refine((data) => data.passwordConfirm === data.password, {
    message: "Passwords do not match",
    path: ["passwordConfirm"]
});
export default RegisterSchema;
