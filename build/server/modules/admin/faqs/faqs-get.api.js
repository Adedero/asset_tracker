import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/admins/me",
    path: "/faqs{/:faq_id}"
}, defineHandler(async (req) => {
    const { faq_id } = req.params;
    const parsedQuery = req.parsedQuery;
    if (faq_id) {
        const faq = await prisma.faq.findUnique({
            where: { id: faq_id }
        });
        if (!faq) {
            throw HttpException.notFound("Faq not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            faq
        };
        return payload;
    }
    const faqs = await prisma.faq.findMany({
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
        faqs
    };
    return payload;
}));
