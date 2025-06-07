import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { z } from "zod";
import Decimal from "decimal.js";
import prisma from "#src/lib/prisma/prisma";
import { HttpException } from "#src/lib/api/http";
import { alertEmitter } from "#src/events/alert.event";
const Schema = z.object({
    terminationReason: z.string({ message: "Termination reason is required" }),
    terminator: z.string({ message: "Terminator is required" }),
    applyTerminationFee: z.boolean({ message: "Apply termination fee option is required" })
});
export default api({
    group: "/admins/me",
    path: "/investments/:investment_id/terminate",
    method: "post",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const { investment_id } = req.params;
    const { terminator, applyTerminationFee, terminationReason } = req.validatedBody;
    const investment = await prisma.investment.findUnique({
        where: { id: investment_id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    account: {
                        select: {
                            id: true,
                            walletBalance: true
                        }
                    }
                }
            }
        }
    });
    if (!investment) {
        throw HttpException.notFound("Investment not found");
    }
    if (investment.investmentStatus === "TERMINATED" || investment.investmentStatus === "CLOSED") {
        throw HttpException.badRequest("Investment is already resolved and cannot be terminated");
    }
    const { account } = investment.user;
    if (!account) {
        throw HttpException.notFound("Account not found");
    }
    const walletBalance = new Decimal(account.walletBalance || 0);
    const initialDeposit = new Decimal(investment.initialDeposit || 0);
    const currentTotalReturns = new Decimal(investment.currentTotalReturns || 0);
    const terminationFee = new Decimal(applyTerminationFee ? investment.terminationFee : 0);
    const updatedInvestment = {};
    let updatedWalletBalance = 0;
    if (investment.autocompounded) {
        if (investment.currentTotalReturns >= investment.initialDeposit) {
            updatedWalletBalance = walletBalance
                .plus(currentTotalReturns.minus(terminationFee))
                .toDecimalPlaces(2)
                .toNumber();
        }
        else {
            const balance = initialDeposit.minus(currentTotalReturns.minus(terminationFee));
            updatedWalletBalance = walletBalance
                .plus(currentTotalReturns.plus(balance))
                .toDecimalPlaces(2)
                .toNumber();
        }
        updatedInvestment.hasTransferedProfitToWallet = true;
    }
    if (!investment.autocompounded) {
        if (investment.currentTotalReturns >= investment.initialDeposit) {
            if (walletBalance.minus(terminationFee).lessThan(0)) {
                throw HttpException.badRequest("Insufficient funds to pay the investment termination fee");
            }
            updatedWalletBalance = walletBalance.minus(terminationFee).toDecimalPlaces(2).toNumber();
        }
        else {
            const debt = initialDeposit.minus(currentTotalReturns.minus(terminationFee));
            if (walletBalance.plus(debt).lessThan(0)) {
                throw HttpException.badRequest("Insufficient funds to pay the investment termination fee");
            }
            updatedWalletBalance = walletBalance.plus(debt).toDecimalPlaces(2).toNumber();
        }
    }
    updatedInvestment.investmentStatus = "TERMINATED";
    updatedInvestment.terminator = terminator;
    updatedInvestment.terminatedAt = new Date();
    updatedInvestment.closedAt = new Date();
    updatedInvestment.terminationFeeApplied = true;
    updatedInvestment.terminationReason = terminationReason;
    await prisma.$transaction([
        prisma.investment.update({
            where: { id: investment.id },
            data: updatedInvestment
        }),
        prisma.account.update({
            where: { id: account.id },
            data: { walletBalance: updatedWalletBalance }
        })
    ]);
    const payload = {
        success: true,
        message: "Investment terminated",
        investment: { ...investment, ...updatedInvestment }
    };
    alertEmitter.emit("investment:terminate", {
        investment: { ...investment, ...updatedInvestment },
        user: investment.user
    });
    return payload;
}));
