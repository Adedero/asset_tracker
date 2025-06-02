import { z } from "zod";

const LoginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .trim(),
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .trim()
});

export default LoginSchema;
