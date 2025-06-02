import { Transaction } from "#src/prisma-gen/index";
import { sendTemplateEmail } from "#src/lib/email/email";
import generic from "#src/lib/email/mail-templates/generic";
import prisma from "#src/lib/prisma/prisma";
import env from "#src/utils/env";
import logger from "#src/utils/logger";

export interface DepositAlertData {
  user: { id: string; name: string; email: string };
  transaction: Transaction;
}

export async function onDepositCreate({ user, transaction }: DepositAlertData) {
  const subject = "New Deposit Request";

  const message = (name?: string) => {
    const info = name
      ? `You initiated a deposit request of $${transaction.amountInUSD.toLocaleString()} into your wallet.`
      : `A new deposit request of $${transaction.amountInUSD.toLocaleString()} was initiated by ${user.name}`;

    return {
      greeting: `Hello ${name ? name : "Admin"}!`,
      info,
      details: {
        Amount: `$${transaction.amountInUSD.toLocaleString()}`,
        Medium: transaction.isWireTransfer
          ? "Wire Transfer"
          : transaction.isGiftCard
            ? "Gift Card"
            : transaction.currency,
        ...(!transaction.isWireTransfer &&
          !transaction.isGiftCard && {
            Rate: `$${transaction.rate}`,
            "Amount In Selected Currency": `${transaction.amountInCurrency} ${transaction.currency}`,
            "Deposited To Wallet Address": transaction.depositWalletAddress
          }),
        Status: transaction.transactionStatus
      },
      note: transaction.isWireTransfer
        ? "The deposit request has been submitted and the details of the wire transfer will emailed shortly."
        : "The deposit request will be processed within 24 hours.",
      footer: "This email was sent because a deposit request was initiated."
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

      sendTemplateEmail(
        { email: env.get("SUPPORT_EMAIL_USER"), subject, sections: message() },
        generic
      )
    ]);
  } catch (error) {
    logger.error(`Alerts failed for deposit request: ${transaction.id}`, error as Error);
  }
}
