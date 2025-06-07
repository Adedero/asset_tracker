import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/users/me",
    path: "/investment-plans{/:investment_plan_id}",
    method: "get"
}, defineHandler(async (req) => {
    const investment_plan_id = req.params.investment_plan_id?.toString();
    const parsedQuery = req.parsedQuery;
    if (investment_plan_id) {
        const investmentPlan = await prisma.investmentPlan.findUnique({
            where: { id: investment_plan_id }
        });
        if (!investmentPlan) {
            throw HttpException.notFound("Not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            plan: investmentPlan
        };
        return payload;
    }
    const investmentPlans = await prisma.investmentPlan.findMany();
    const payload = {
        success: true,
        message: "Successful",
        plans: investmentPlans
    };
    return payload;
}));
