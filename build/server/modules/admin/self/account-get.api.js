import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/admins/me",
    path: "account",
    method: "get"
}, defineHandler(async (req) => {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            account: true
        }
    });
    if (!user || !user.account) {
        throw HttpException.notFound("Account not found");
    }
    const { account } = user;
    if (!account) {
        throw HttpException.notFound("Account not found");
    }
    /* @ts-ignore */
    delete user.password;
    const payload = {
        success: true,
        user: {
            ...user,
            account
        }
    };
    return payload;
}));
