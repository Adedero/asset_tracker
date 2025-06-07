import { sendTemplateEmail } from "#src/lib/email/email";
import generic from "#src/lib/email/mail-templates/generic";
import prisma from "#src/lib/prisma/prisma";
import env from "#src/utils/env";
import logger from "#src/utils/logger";
export async function onWithdrawalCreate({ user, transaction }) {
    const subject = "New Withdrawal Request";
    const message = (name) => {
        const info = name
            ? `You initiated a withdrawal request of $${transaction.amountInUSD.toLocaleString()} from your wallet.`
            : `A new withdrawal request of $${transaction.amountInUSD.toLocaleString()} was initiated by ${user.name}`;
        return {
            greeting: `Hello ${name ? name : "Admin"}!`,
            info,
            details: {
                Amount: `$${transaction.amountInUSD.toLocaleString()}`,
                Charge: `$${transaction.charge.toLocaleString()}`,
                "Actual amount to be withdrawn": `$${transaction.actualAmountInUSD.toLocaleString()}`,
                Currency: transaction.currency,
                Rate: `$${transaction.rate}`,
                "Amount in the selected currency": `${transaction.amountInCurrency} ${transaction.currency}`,
                "Provided Wallet Address": transaction.withdrawalWalletAddress,
                "Provided Wallet Address Network": transaction.withdrawalWalletAddressNetwork,
                Status: transaction.transactionStatus
            },
            note: `The withdrawal request will be processed within 24 hours. ${name ? `Please contact us if you are not credited after then.` : ""}`,
            footer: "This email was sent because a withdrawal request was initiated."
        };
    };
    try {
        await Promise.all([
            prisma.notification.create({
                data: {
                    userId: user.id,
                    title: subject,
                    description: message(user.name).info
                }
            }),
            sendTemplateEmail({ email: user.email, subject, sections: message(user.name) }, generic),
            sendTemplateEmail({ email: env.get("SUPPORT_EMAIL_USER"), subject, sections: message() }, generic)
        ]);
    }
    catch (error) {
        logger.error(`Alerts failed for withdrawal request: ${transaction.id}`, error);
    }
}
