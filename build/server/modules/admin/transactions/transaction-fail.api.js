import { alertEmitter } from "#src/events/alert.event";
import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import Decimal from "decimal.js";
import { z } from "zod";
const Schema = z.object({
    failReason: z.string({ message: "Reason for failing the transaction is required" })
}, { message: "No request body provided" });
export default api({
    group: "/admins/me",
    path: "/transactions/:transaction_id/fail",
    method: "put",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const { transaction_id } = req.params;
    const { failReason } = req.validatedBody;
    const transaction = await prisma.transaction.findUnique({
        where: { id: transaction_id }
    });
    if (!transaction)
        throw HttpException.notFound("Transaction not found");
    const promises = [];
    promises.push(prisma.transaction.update({
        where: { id: transaction.id },
        data: {
            transactionStatus: "FAILED",
            approvedAt: null,
            failedAt: new Date(),
            failReason
        },
        include: { user: true }
    }));
    if (transaction.transactionType === "WITHDRAWAL") {
        const account = await prisma.account.findUnique({
            where: { userId: transaction.userId }
        });
        if (!account)
            throw HttpException.notFound("User's account not found");
        const walletBalance = new Decimal(account.walletBalance);
        const amountInUSD = new Decimal(transaction.amountInUSD);
        promises.push(prisma.account.update({
            where: { id: account.id },
            data: {
                walletBalance: walletBalance.plus(amountInUSD).toDecimalPlaces(2).toNumber()
            }
        }));
    }
    const [updatedTransaction] = (await prisma.$transaction(promises));
    alertEmitter.emit("transaction:status-update", {
        transaction: updatedTransaction,
        user: updatedTransaction.user
    });
    return {
        success: true,
        message: "Transaction marked as failed",
        transaction: updatedTransaction
    };
}));
