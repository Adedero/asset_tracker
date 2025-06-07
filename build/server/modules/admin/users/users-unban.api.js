import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { z } from "zod";
import { InvestmentStatus } from "#src/prisma-gen/index";
const Schema = z.object({
    unfreezeInvestments: z.boolean().default(true)
});
export default api({
    group: "/admins/me",
    path: "/users/:user_id/unban",
    method: "put",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const { user_id } = req.params;
    const { unfreezeInvestments } = req.validatedBody;
    const user = await prisma.user.findUnique({
        where: {
            id: user_id
        }
    });
    if (!user) {
        throw HttpException.notFound("User not found");
    }
    const promises = [
        prisma.user.update({
            where: { id: user_id },
            data: {
                isBanned: false,
                ban: {
                    update: {
                        active: false
                    }
                }
            }
        })
    ];
    if (unfreezeInvestments) {
        promises.push(prisma.investment.updateMany({
            where: { userId: user_id, investmentStatus: InvestmentStatus.PAUSED },
            data: {
                investmentStatus: InvestmentStatus.OPEN
            }
        }));
    }
    await prisma.$transaction(promises);
    return {
        success: true,
        message: "User unbanned successfully"
    };
}));
