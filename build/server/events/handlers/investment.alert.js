"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onInvestmentCreate = onInvestmentCreate;
exports.onInvestmentClose = onInvestmentClose;
exports.onInvestmentPauseToggle = onInvestmentPauseToggle;
exports.onInvestmentTerminate = onInvestmentTerminate;
const email_1 = require("#src/lib/email/email");
const generic_1 = __importDefault(require("#src/lib/email/mail-templates/generic"));
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const env_1 = __importDefault(require("#src/utils/env"));
const logger_1 = __importDefault(require("#src/utils/logger"));
async function onInvestmentCreate({ user, investment }) {
    const subject = "New Investment";
    const message = (name) => {
        return {
            greeting: `Hello ${name ? name : "Admin"}!`,
            info: `${name ? "You" : user.name} started a new investment`,
            details: {
                "Investment Name": investment.investmentName,
                "Investment Tier": investment.investmentTier,
                "Initial Deposit": `$${investment.initialDeposit.toLocaleString()}`,
                Duration: `${investment.duration} days`
            },
            ...(investment.autocompounded && {
                more: `This investment is autocompounded. The returns from this investment will only be added to ${name ? "your" : "the client's"} account balance upon completion or termination of the investment.`
            }),
            ...(!investment.autocompounded && {
                more: `This investment is not autocompounded. The daily returns from this investment will be added to ${name ? "your" : "the client's"} account balance daily.`
            }),
            footer: `This message was sent to you because ${name ? "you" : "a client"} started a new investment.`
        };
    };
    try {
        await Promise.all([
            prisma_1.default.notification.create({
                data: {
                    userId: user.id,
                    title: subject,
                    description: message(user.name).info + " " + message(user.name).more
                }
            }),
            (0, email_1.sendTemplateEmail)({ email: user.email, subject, sections: message(user.name) }, generic_1.default),
            (0, email_1.sendTemplateEmail)({ email: env_1.default.get("SUPPORT_EMAIL_USER"), subject, sections: message() }, generic_1.default)
        ]);
    }
    catch (error) {
        logger_1.default.error(`Alerts failed for investment creation: ${investment.id}`, error);
    }
}
async function onInvestmentClose({ user, investment }) {
    const subject = "Investment Closure";
    const mailReason = "This message was sent to you because an investment was closed.";
    const message = (name) => {
        return {
            greeting: `Hello ${name ? name : "Admin"}!`,
            info: `${name ? "Your" : `${user.name}'s`} investment on ${investment.investmentName} plan, ${investment.investmentTier} tier has completed its duration and is now closed.`,
            details: {
                "Investment Name": investment.investmentName,
                Tier: investment.investmentTier,
                Deposit: `$${investment.initialDeposit.toLocaleString()}`,
                Duration: `${investment.duration} days`,
                "Total Returns": `$${investment.currentTotalReturns.toLocaleString()}`
            },
            more: investment.autocompounded
                ? `This investment was autocompounded. The returns from this investment have been added to ${name ? "your" : "the client's"} account balance.`
                : `This investment was not autocompounded. The returns from this investment were added daily to ${name ? "your" : "the client's"} account balance.`
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
        logger_1.default.error(`Alerts failed for investment closure: ${investment.id}`, error);
    }
}
async function onInvestmentPauseToggle({ user, investment }) {
    const conditional = (str1, str2, condition = investment.investmentStatus === "PAUSED") => {
        return condition ? str1 : str2;
    };
    const subject = conditional("Pause of Investment", "Resumption of Investment");
    const mailReason = `This message was sent because an investment was ${conditional("paused", "resumed")}`;
    const message = (name) => {
        return {
            greeting: `Hello ${name ? name : "Admin"}!`,
            info: "The investment "
                .concat(`${investment.investmentName} (${investment.investmentTier} Tier) `)
                .concat(conditional(`was paused by the ${env_1.default.get("APP_NAME")} admin `, "has been resumed"))
                .concat(conditional(`with reason ${investment.pausedReason}`, "")),
            details: {
                "Investment Name": investment.investmentName,
                "Investment Tier": investment.investmentTier,
                Status: conditional("Paused", "Open"),
                ...(investment.investmentStatus === "PAUSED" &&
                    !!investment.pausedReason && { "Reason for Pause": investment.pausedReason }),
                "Total Returns": `$${investment.currentTotalReturns.toLocaleString()}`
            }
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
        logger_1.default.error(`Alerts failed for investment pause toggle: ${investment.id}`, error);
    }
}
async function onInvestmentTerminate({ user, investment }) {
    const subject = "Termination of Investment";
    const message = (name) => {
        const info = `The investment ${investment.investmentName} (${investment.investmentTier} Tier) was terminated by ${investment.terminator === "USER" && name ? "you" : investment.terminator === "USER" && !name ? user.name : `the ${env_1.default.get("APP_NAME")} admin`} ${!investment.terminationReason ? "without reason." : "with reason: " + investment.terminationReason}.`;
        return {
            greeting: `Hello ${name ? name : "Admin"}!`,
            info,
            details: {
                "Investment Name": investment.investmentName,
                "Investment Tier": investment.investmentTier,
                "Termination Fee": `$${investment.terminationFee.toLocaleString()}`,
                "Reason for Termination": investment.terminationReason,
                "Current Total Returns": `$${investment.currentTotalReturns.toLocaleString()}`
            },
            footer: `This message was sent to you an investment was terminated.`
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
        logger_1.default.error(`Alerts failed for investment termination: ${investment.id}`, error);
    }
}
