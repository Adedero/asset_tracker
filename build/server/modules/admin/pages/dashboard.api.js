import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/admins/me",
    path: "/dashboard",
    method: "get"
}, defineHandler(async () => {
    const [usersCount, adminsCount, openInvestmentsCount, currenciesCount, investmentPlansCount, recentTransactions, recentInvestments] = await Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.investment.count({ where: { investmentStatus: "OPEN" } }),
        prisma.currency.count({}),
        prisma.investmentPlan.count({}),
        prisma.transaction.findMany({
            include: { user: true },
            orderBy: { createdAt: "desc" },
            take: 3
        }),
        prisma.investment.findMany({
            include: { user: true },
            orderBy: { createdAt: "desc" },
            take: 3
        })
    ]);
    const payload = {
        overview: {
            usersCount,
            adminsCount,
            openInvestmentsCount,
            currenciesCount,
            investmentPlansCount,
            recentTransactions,
            recentInvestments
        }
    };
    return payload;
}));
