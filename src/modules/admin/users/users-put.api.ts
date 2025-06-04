import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { z } from "zod";

const Schema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters long" }).optional(),
  image: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
  country: z.string().trim().optional(),
  region: z.string().trim().optional(),
  verified: z.boolean().optional(),
  accountGroupId: z.string().optional()
});

export default api(
  {
    group: "/admins/me",
    path: "/users/:user_id",
    method: "put",
    middleware: defineValidator("body", Schema)
  },
  defineHandler(async (req) => {
    const data = req.validatedBody as z.infer<typeof Schema>;
    const userId = req.params.user_id;
    const user = await prisma.user.update({
      where: { id: userId },
      data
    });
    return {
      success: true,
      message: "Profile updated successfully",
      user
    };
  })
);
