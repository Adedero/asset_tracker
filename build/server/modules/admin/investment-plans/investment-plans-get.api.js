import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/admins/me",
    path: "/investment-plans{/:investment_plan_id}"
}, defineHandler(async (req) => {
    const { investment_plan_id } = req.params;
    const parsedQuery = req.parsedQuery;
    if (investment_plan_id) {
        const investmentPlan = await prisma.investmentPlan.findUnique({
            where: { id: investment_plan_id }
        });
        if (!investmentPlan) {
            throw HttpException.notFound("InvestmentPlan not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            investmentPlan
        };
        return payload;
    }
    const investmentPlans = await prisma.investmentPlan.findMany({
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
        investmentPlans
    };
    return payload;
}));
