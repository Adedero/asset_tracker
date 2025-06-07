import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/admins/me",
    path: "/accounts{/:account_id}"
}, defineHandler(async (req) => {
    const { account_id } = req.params;
    const parsedQuery = req.parsedQuery;
    if (account_id) {
        const account = await prisma.account.findUnique({
            where: { id: account_id },
            include: { user: true }
        });
        if (!account) {
            throw HttpException.notFound("Account not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            account
        };
        return payload;
    }
    const accounts = await prisma.account.findMany({
        //@ts-ignore
        where: { ...(parsedQuery?.where || {}) },
        include: { user: true },
        orderBy: parsedQuery?.sort,
        take: parsedQuery?.take,
        skip: parsedQuery?.skip
    });
    const payload = {
        success: true,
        message: "Successful",
        accounts
    };
    return payload;
}));
