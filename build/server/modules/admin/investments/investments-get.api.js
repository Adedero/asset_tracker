import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/admins/me",
    path: "/investments{/:investment_id}",
    method: "get"
}, defineHandler(async (req) => {
    const investment_id = req.params.investment_id?.toString();
    const parsedQuery = req.parsedQuery;
    if (investment_id) {
        const investment = await prisma.investment.findUnique({
            where: { id: investment_id },
            include: { user: true, ...(parsedQuery?.populate || {}) }
        });
        if (!investment) {
            throw HttpException.notFound("Investment not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            investment
        };
        return payload;
    }
    const investments = await prisma.investment.findMany({
        //@ts-ignore
        where: { ...(parsedQuery?.where || {}) },
        include: { user: true },
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
        investments
    };
    return payload;
}));
