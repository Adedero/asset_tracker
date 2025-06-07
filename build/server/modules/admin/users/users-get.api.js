import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/admins/me",
    path: "/users{/:user_id}",
    method: "get"
}, defineHandler(async (req) => {
    const user_id = req.params.user_id?.toString();
    const parsedQuery = req.parsedQuery;
    if (user_id) {
        const user = await prisma.user.findUnique({
            where: { id: user_id },
            include: {
                account: true,
                ban: true,
                accountGroup: true,
                ...(parsedQuery?.populate || {})
            }
        });
        if (!user) {
            throw HttpException.notFound("User not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            user
        };
        return payload;
    }
    const users = await prisma.user.findMany({
        //@ts-ignore
        where: { ...(parsedQuery?.where || {}) },
        include: {
            accountGroup: {
                select: { name: true, id: true }
            }
        },
        /*  //@ts-ignore
        select: {
          ...(parsedQuery?.select || {}),
          ...(parsedQuery?.populate || {}),
          ...(parsedQuery?.exclude || {})
        }, */
        orderBy: parsedQuery?.sort,
        take: parsedQuery?.take,
        skip: parsedQuery?.skip
    });
    const payload = {
        success: true,
        message: "Successful",
        //@ts-ignore
        users
    };
    return payload;
}));
