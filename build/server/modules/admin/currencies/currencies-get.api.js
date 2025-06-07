import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/admins/me",
    path: "/currencies{/:currency_id}"
}, defineHandler(async (req) => {
    const { currency_id } = req.params;
    const parsedQuery = req.parsedQuery;
    if (currency_id) {
        const currency = await prisma.currency.findUnique({
            where: { id: currency_id }
        });
        if (!currency) {
            throw HttpException.notFound("Currency not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            currency
        };
        return payload;
    }
    const currencies = await prisma.currency.findMany({
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
        currencies
    };
    return payload;
}));
