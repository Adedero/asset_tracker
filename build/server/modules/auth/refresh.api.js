import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import env from "#src/utils/env";
import jwt from "jsonwebtoken";
export default api({
    group: "/auth",
    path: "/refresh/:refreshToken",
    method: "get"
}, defineHandler(async (req) => {
    const refreshToken = req.params.refreshToken;
    const payload = jwt.verify(refreshToken, env.get("JWT_REFRESH_SECRET"));
    const { id } = payload;
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) {
        throw HttpException.notFound("User not found");
    }
    const newAccessToken = jwt.sign({ id: user.id }, env.get("JWT_ACCESS_SECRET"));
    return {
        accessToken: newAccessToken,
        success: true
    };
}));
