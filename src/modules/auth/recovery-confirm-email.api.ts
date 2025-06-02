import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ApiResponse } from "#src/types/api-response";
import { z } from "zod";

const Schema = z.object({
  email: z.string({ message: "Email is required" }).email({ message: "Invalid email" })
});

export interface ConfirmEmailApiResponse extends ApiResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default api(
  {
    group: "/auth",
    path: "/recovery/confirm-email",
    method: "post",
    middleware: defineValidator("body", Schema)
  },
  defineHandler(async (req) => {
    const { email } = req.validatedBody as z.infer<typeof Schema>;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      throw HttpException.notFound("Account not found");
    }

    const payload: ConfirmEmailApiResponse = {
      success: true,
      message: "Email confirmed successfully",
      user
    };

    return payload;
  })
);
