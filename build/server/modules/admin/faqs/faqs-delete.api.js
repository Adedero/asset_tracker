import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { HttpException } from "#src/lib/api/http";
export default api({
    group: "/admins/me",
    path: "/faqs{/:faq_id}",
    method: "delete"
}, defineHandler(async (req) => {
    const { faq_id } = req.params;
    const faq = await prisma.faq.delete({
        where: { id: faq_id }
    });
    if (!faq) {
        throw HttpException.notFound("Faq not found");
    }
    const payload = {
        success: true,
        message: "Faq deleted successfully,",
        faq
    };
    return payload;
}));
