import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/admins/me",
    path: "/account-groups{/:account_group_id}"
}, defineHandler(async (req) => {
    const { account_group_id } = req.params;
    const parsedQuery = req.parsedQuery;
    if (account_group_id) {
        const accountGroup = await prisma.accountGroup.findUnique({
            where: { id: account_group_id }
        });
        if (!accountGroup) {
            throw HttpException.notFound("Account group not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            accountGroup
        };
        return payload;
    }
    const accountGroups = await prisma.accountGroup.findMany({
        //@ts-ignore
        where: { ...(parsedQuery?.where || {}) },
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
        accountGroups
    };
    return payload;
}));
