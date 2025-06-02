import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import LoginSchema from "#src/shared/schemas/login.schema";
import { compare } from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
import env from "#src/utils/env";
import { JWT_ACCESS_TOKEN_EXPIRY, JWT_REFRESH_TOKEN_EXPIRY } from "#src/utils/constants";
import { ApiResponse } from "#src/types/api-response";

export interface LoginApiRespone extends ApiResponse {
  user: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    role: "ADMIN" | "USER";
    accessToken: string;
    refreshToken: string;
  };
}

export default api(
  {
    group: "/auth",
    path: "/login",
    method: "post",
    middleware: defineValidator("body", LoginSchema)
  },
  defineHandler(async (req) => {
    const { email, password } = req.validatedBody as z.infer<typeof LoginSchema>;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        verified: true,
        role: true,
        password: true
      }
    });

    const mockHash = "hashed_password";
    const isPasswordValid = await compare(password, user?.password || mockHash);

    if (!user || !isPasswordValid) {
      throw HttpException.badRequest("Invalid email or password");
    }

    const accessToken = jwt.sign({ id: user.id }, env.get("JWT_ACCESS_SECRET", "secret_1"), {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRY
    });

    const refreshToken = jwt.sign({ id: user.id }, env.get("JWT_REFRESH_SECRET", "secret_2"), {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRY
    });

    const response: LoginApiRespone = {
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        role: user.role,
        accessToken,
        refreshToken
      }
    };

    return response;
  })
);
