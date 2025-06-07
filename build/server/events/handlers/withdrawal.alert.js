"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onWithdrawalCreate = onWithdrawalCreate;
const email_1 = require("#src/lib/email/email");
const generic_1 = __importDefault(require("#src/lib/email/mail-templates/generic"));
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const env_1 = __importDefault(require("#src/utils/env"));
const logger_1 = __importDefault(require("#src/utils/logger"));
async function onWithdrawalCreate({ user, transaction }) {
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
        logger_1.default.error(`Alerts failed for withdrawal request: ${transaction.id}`, error);
    }
}
