"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onTransactionStatusUpdate = onTransactionStatusUpdate;
const email_1 = require("#src/lib/email/email");
const button_1 = __importDefault(require("#src/lib/email/mail-templates/components/button"));
const generic_1 = __importDefault(require("#src/lib/email/mail-templates/generic"));
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const env_1 = __importDefault(require("#src/utils/env"));
const logger_1 = __importDefault(require("#src/utils/logger"));
async function onTransactionStatusUpdate({ user, transaction }) {
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
        cta: (0, button_1.default)(conditional(
        /* transactions/:transaction_id/receipt */
        new URL(`user/transactions/${transaction.id}/receipt`, env_1.default.get("APP_URL")).href, new URL(`admin/transactions/${transaction.id}`, env_1.default.get("APP_URL")).href, !!name), "View Transaction", { centered: true })
    });
    try {
        await Promise.all([
            prisma_1.default.notification.create({
                data: {
                    userId: user.id,
                    title: subject,
                    description: message(user.name).info
                }
            }),
            (0, email_1.sendTemplateEmail)({
                email: user.email,
                subject,
                mailReason,
                sections: message(user.name)
            }, generic_1.default),
            (0, email_1.sendTemplateEmail)({
                email: env_1.default.get("SUPPORT_EMAIL_USER"),
                subject,
                mailReason,
                sections: message()
            }, generic_1.default)
        ]);
    }
    catch (error) {
        logger_1.default.error(`Alerts failed for transaction status update: ${transaction.id}`, error);
    }
    function conditional(str1, str2, condition = transaction.transactionStatus === "SUCCESSFUL") {
        return condition ? str1 : str2;
    }
}
