import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { Faq } from "#src/prisma-gen";
import { ApiResponse } from "#src/types/api-response";
import { z } from "zod";

const Schema = z.object({
  slug: z.string({ message: "Slug is required" }).trim(),
  title: z.string({ message: "Title is required" }).trim(),
  description: z.string({ message: "Description is required" }).trim()
});

export interface FaqCreateApiResponse extends ApiResponse {
  faq: Faq;
}

export default api(
  {
    group: "/admins/me",
    path: "/faqs",
    method: "post",
    middleware: defineValidator("body", Schema)
  },
  defineHandler<FaqCreateApiResponse>(async (req) => {
    const data = req.validatedBody as z.infer<typeof Schema>;

    const existingFaq = await prisma.faq.findFirst({
      where: {
        OR: [{ title: data.title }, { slug: data.slug }]
      }
    });

    if (existingFaq) {
      throw HttpException.badRequest("A faq with this name or slug already exists");
    }

    const faq = await prisma.faq.create({
      data
    });

    return {
      statusCode: 201,
      success: true,
      message: "Faq updated successfully",
      faq
    };
  })
);
