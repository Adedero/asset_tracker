import { sendTemplateEmail } from "#src/lib/email/email";
import button from "#src/lib/email/mail-templates/components/button";
import generic from "#src/lib/email/mail-templates/generic";
import prisma from "#src/lib/prisma/prisma";
import env from "#src/utils/env";
import logger from "#src/utils/logger";
export async function onTransactionStatusUpdate({ user, transaction }) {
    const subject = "Transaction Status Updated";
    const mailReason = `This message was sent because of an update was made to the transaction with ID ${transaction.id}`;
    const message = (name) => ({
        greeting: `Hello ${name ? name : "Admin"}!`,
        info: conditional(`The ${transaction.transactionType} request with transaction ID ${transaction.id} has been approved.`.concat(conditional(`Your wallet has been credited with $${transaction.amountInUSD.toLocaleString()}.`, "", transaction.transactionType === "WITHDRAWAL" && !!name)), "The "
            .concat(transaction.transactionType)
            .concat(" request with transaction ID ")
            .concat(transaction.id)
            .concat(" failed ")
            .concat(transaction.failReason ? `with reason: ${transaction.failReason}` : "without reason.")
            .concat("\n")
            .concat(conditional(`$${transaction.actualAmountInUSD.toLocaleString()} has been refunded to your wallet.`, "", transaction.transactionType === "WITHDRAWAL" && !!name))),
        details: {
            Amount: `$${transaction.amountInUSD.toLocaleString()}`,
            Type: transaction.transactionType,
            Status: transaction.transactionStatus,
            ...(transaction.transactionStatus === "FAILED" && {
                "Reason For Failure": transaction.failReason
            })
        },
        direction: "Click the button to view the details of the transaction",
        cta: button(conditional(
        /* transactions/:transaction_id/receipt */
        new URL(`user/transactions/${transaction.id}/receipt`, env.get("APP_URL")).href, new URL(`admin/transactions/${transaction.id}`, env.get("APP_URL")).href, !!name), "View Transaction", { centered: true })
    });
    try {
        await Promise.all([
            prisma.notification.create({
                data: {
                    userId: user.id,
                    title: subject,
                    description: message(user.name).info
                }
            }),
            sendTemplateEmail({
                email: user.email,
                subject,
                mailReason,
                sections: message(user.name)
            }, generic),
            sendTemplateEmail({
                email: env.get("SUPPORT_EMAIL_USER"),
                subject,
                mailReason,
                sections: message()
            }, generic)
        ]);
    }
    catch (error) {
        logger.error(`Alerts failed for transaction status update: ${transaction.id}`, error);
    }
    function conditional(str1, str2, condition = transaction.transactionStatus === "SUCCESSFUL") {
        return condition ? str1 : str2;
    }
}
