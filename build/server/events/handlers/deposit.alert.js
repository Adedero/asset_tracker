"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDepositCreate = onDepositCreate;
const email_1 = require("#src/lib/email/email");
const generic_1 = __importDefault(require("#src/lib/email/mail-templates/generic"));
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const env_1 = __importDefault(require("#src/utils/env"));
const logger_1 = __importDefault(require("#src/utils/logger"));
async function onDepositCreate({ user, transaction }) {
    const subject = "New Deposit Request";
    const message = (name) => {
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
            prisma_1.default.notification.create({
                data: {
                    userId: user.id,
                    title: subject,
                    description: message(user.name).info
                }
            }),
            (0, email_1.sendTemplateEmail)({ email: user.email, subject, sections: message(user.name) }, generic_1.default),
            (0, email_1.sendTemplateEmail)({ email: env_1.default.get("SUPPORT_EMAIL_USER"), subject, sections: message() }, generic_1.default)
        ]);
    }
    catch (error) {
        logger_1.default.error(`Alerts failed for deposit request: ${transaction.id}`, error);
    }
}
