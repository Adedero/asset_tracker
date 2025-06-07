import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/users/me",
    path: "/faq{/:faq_id_slug}",
    method: "get"
}, defineHandler(async (req) => {
    const userId = req.user.id;
    const faq_id_slug = req.params.faq_id_slug;
    const parsedQuery = req.parsedQuery;
    if (faq_id_slug) {
        const faq = await prisma.faq.findFirst({
            where: {
                OR: [{ id: faq_id_slug }, { slug: faq_id_slug }]
            }
        });
        if (!faq) {
            throw HttpException.notFound("Not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            faq
        };
        return payload;
    }
    const faq = await prisma.faq.findMany({
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
        faq
    };
    return payload;
}));
