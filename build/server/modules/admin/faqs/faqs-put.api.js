import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { z } from "zod";
const Schema = z.object({
    slug: z.string({ message: "Slug is required" }).trim(),
    title: z.string({ message: "Title is required" }).trim(),
    description: z.string({ message: "Description is required" }).trim()
});
export default api({
    group: "/admins/me",
    path: "/faqs/:faq_id_or_slug",
    method: "put",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const data = req.validatedBody;
    const { faq_id_or_slug } = req.params;
    const existingFaq = await prisma.faq.findFirst({
        where: {
            NOT: {
                OR: [{ id: faq_id_or_slug }, { slug: faq_id_or_slug }]
            },
            OR: [{ title: data.title }, { slug: data.slug }]
        }
    });
    if (existingFaq) {
        throw HttpException.badRequest("A faq with this name or slug already exists");
    }
    const faq = await prisma.faq.updateManyAndReturn({
        where: {
            OR: [{ id: faq_id_or_slug }, { slug: faq_id_or_slug }]
        },
        data
    });
    return {
        statusCode: 201,
        success: true,
        message: "Faq updated successfully",
        faq: faq[0]
    };
}));
