import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/users/me",
    path: "/dashboard",
    method: "get"
}, defineHandler(async (req) => {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            account: { select: { walletBalance: true } }
        }
    });
    if (!user) {
        throw HttpException.notFound("User not found");
    }
    const activeInvestments = await prisma.investment.findMany({
        where: { userId: user.id, investmentStatus: "OPEN" }
    });
    const { tid, tr, nwr } = activeInvestments.reduce((acc, inv) => {
        acc.tid += inv.initialDeposit;
        acc.tr += inv.currentTotalReturns;
        if (inv.autocompounded) {
            acc.nwr += inv.currentTotalReturns;
        }
        return acc;
    }, { tid: 0, tr: 0, nwr: 0 });
    const payload = {
        success: true,
        message: "Successful",
        overview: {
            walletBalance: user.account?.walletBalance || 0,
            activeInvestments: activeInvestments.length,
            totalInvestmentDeposit: tid,
            totalReturns: tr,
            nonWithdrawableReturns: nwr
        }
    };
    return payload;
}));
