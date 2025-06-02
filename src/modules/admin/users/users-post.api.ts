import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { MIN_PASSWORD_LENGTH } from "#src/utils/constants";
import { z } from "zod";

const Schema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z.string().min(MIN_PASSWORD_LENGTH, {
    message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
  }),
  image: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
  country: z.string().trim().optional(),
  region: z.string().trim().optional(),
  verified: z.boolean().optional()
});

export default api(
  {
    group: "/admins/me",
    path: "/users",
    method: "post",
    middleware: defineValidator("body", Schema)
  },
  defineHandler(async (req) => {
    const data = req.validatedBody as z.infer<typeof Schema>;
    const user = await prisma.user.create({
      data: {
        ...data,
        account: {
          create: {
            walletBalance: 0
          }
        }
      }
    });
    return {
      success: true,
      message: "Profile updated successfully",
      user
    };
  })
);
