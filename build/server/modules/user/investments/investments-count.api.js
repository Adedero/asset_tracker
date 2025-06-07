import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/users/me",
    path: "/investments/count",
    method: "get"
}, defineHandler(async (req) => {
    const userId = req.user.id;
    const count = await prisma.investment.count({
        where: { userId }
    });
    return { success: true, count };
}));
