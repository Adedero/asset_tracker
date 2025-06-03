
import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { Faq } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";
import { HttpException } from "#src/lib/api/http";

export interface FaqDeleteApiResponse extends ApiResponse {
  faq: Faq;
}

export default api(
  {
    group: "/admins/me",
    path: "/faqs{/:faq_id}",
    method: "delete"
  },
  defineHandler(async (req) => {
    const { faq_id } = req.params;

    const faq = await prisma.faq.delete({
      where: { id: faq_id },
    });

    if (!faq) {
      throw HttpException.notFound("Faq not found");
    }

    const payload: FaqDeleteApiResponse = {
      success: true,
      message: "Faq deleted successfully,",
      faq
    };

    return payload;
  })
)
