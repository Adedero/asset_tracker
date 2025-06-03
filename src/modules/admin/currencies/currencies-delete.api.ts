import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";

export default api(
  {
    group: "/admins/me",
    path: "/currencies/:currency_id",
    method: "delete"
  },
  defineHandler(async (req) => {
    const { currency_id } = req.params;
    const currency = await prisma.currency.delete({
      where: { id: currency_id }
    });
    return {
      success: true,
      message: "Currency deleted successfully",
      currency
    };
  })
);
