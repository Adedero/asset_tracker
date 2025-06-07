import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/users/me",
    path: "/currencies{/:currency_id}",
    method: "get"
}, defineHandler(async (req) => {
    const currency_id = req.params.currency_id?.toString();
    const parsedQuery = req.parsedQuery;
    if (currency_id) {
        const currency = await prisma.currency.findUnique({
            where: { id: currency_id, ...(parsedQuery?.where || {}) }
        });
        if (!currency) {
            throw HttpException.notFound("Not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            currency
        };
        return payload;
    }
    const currencies = await prisma.currency.findMany({
        where: { ...(parsedQuery?.where || {}) },
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
