"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributeProfit = distributeProfit;
const logger_1 = __importDefault(require("#src/utils/logger"));
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const index_1 = require("#src/prisma-gen/index");
const decimal_js_1 = __importDefault(require("decimal.js"));
const alert_event_1 = require("#src/events/alert.event");
async function distributeProfit() {
    const { start, end, noInvestments, logError, userNotFound, closeInvestment, profitError } = useLogger();
    start();
    const startOfToday = getStartOfTodayUTC();
    try {
        // Fetch only investments that are OPEN and haven't had profit distributed today yet.
        // Also ensures the investment was created *before* today to avoid day 0 distribution.
        const eligibleInvestments = await prisma_1.default.investment.findMany({
            where: {
                investmentStatus: index_1.InvestmentStatus.OPEN,
                createdAt: { lt: startOfToday },
                OR: [{ lastProfitDistributedAt: null }, { lastProfitDistributedAt: { lt: startOfToday } }]
            },
            include: {
                user: { include: { account: true } }
            }
        });
        if (!eligibleInvestments.length) {
            noInvestments();
            return;
        }
        for (const investment of eligibleInvestments) {
            try {
                const { user } = investment;
                // Double check user and account existence (though relation should handle this)
                if (!user || !user.account) {
                    userNotFound(investment.id);
                    continue;
                }
                // --- Convert relevant investment numbers to Decimal for calculation ---
                const initialDeposit = new decimal_js_1.default(investment.initialDeposit);
                const currentTotalReturns = new decimal_js_1.default(investment.currentTotalReturns);
                const expectedTotalReturns = new decimal_js_1.default(investment.expectedTotalReturns);
                const currentCompoundedAmount = investment.currentCompoundedAmount !== null &&
                    investment.currentCompoundedAmount !== undefined
                    ? new decimal_js_1.default(investment.currentCompoundedAmount)
                    : initialDeposit; // Fallback to initialDeposit if null/undefined
                const userWalletBalance = new decimal_js_1.default(user.account.walletBalance);
                // --- Check if Investment Duration is Complete ---
                if (investment.daysCompleted >= investment.duration) {
                    const shortfallDecimal = expectedTotalReturns.sub(currentTotalReturns);
                    if (shortfallDecimal.greaterThan(0)) {
                        await prisma_1.default.$transaction(async (tx) => {
                            const profit = await tx.profit.create({
                                data: {
                                    userId: investment.userId,
                                    accountId: user.account.id,
                                    investmentId: investment.id,
                                    amount: shortfallDecimal.toDecimalPlaces(2).toNumber(),
                                    status: investment.autocompounded
                                        ? index_1.ProfitStatus.FROZEN
                                        : index_1.ProfitStatus.DISTRIBUTED,
                                    ...(!investment.autocompounded && {
                                        distributedAt: new Date()
                                    })
                                }
                            });
                            await tx.transaction.create({
                                data: {
                                    userId: user.id,
                                    actualAmountInUSD: profit.amount,
                                    amountInCurrency: profit.amount,
                                    amountInUSD: profit.amount,
                                    rate: 1,
                                    charge: 0,
                                    currency: "USD",
                                    description: `Final return (shortfall) on ${investment.investmentName} (${investment.investmentTier} Tier)`,
                                    investmentId: investment.id,
                                    isWireTransfer: false,
                                    isGiftCard: false,
                                    transactionStatus: index_1.TransactionStatus.SUCCESSFUL,
                                    transactionType: index_1.TransactionType.PROFIT
                                }
                            });
                            // Update investment state
                            let updatedCurrentTotalReturns = expectedTotalReturns.toDecimalPlaces(2).toNumber();
                            let updatedCurrentCompoundedAmount = investment.currentCompoundedAmount;
                            if (investment.autocompounded) {
                                updatedCurrentCompoundedAmount = currentCompoundedAmount
                                    .add(shortfallDecimal)
                                    .toDecimalPlaces(2)
                                    .toNumber();
                            }
                            else {
                                await tx.user.update({
                                    where: { id: user.id },
                                    data: {
                                        account: {
                                            update: {
                                                walletBalance: userWalletBalance
                                                    .add(shortfallDecimal)
                                                    .toDecimalPlaces(2)
                                                    .toNumber()
                                            }
                                        }
                                    }
                                });
                            }
                            const updatedInvestment = await tx.investment.update({
                                where: { id: investment.id },
                                data: {
                                    currentTotalReturns: updatedCurrentTotalReturns,
                                    currentCompoundedAmount: updatedCurrentCompoundedAmount,
                                    investmentStatus: index_1.InvestmentStatus.CLOSED,
                                    closedAt: new Date()
                                },
                                include: {
                                    user: true
                                }
                            });
                            alert_event_1.alertEmitter.emit("investment:close", {
                                investment: updatedInvestment,
                                user: updatedInvestment.user
                            });
                        }); // End Transaction for Shortfall
                    }
                    else {
                        // No shortfall, just close the investment
                        closeInvestment(investment.id);
                        const updatedInvestment = await prisma_1.default.investment.update({
                            where: { id: investment.id },
                            data: {
                                investmentStatus: index_1.InvestmentStatus.CLOSED,
                                closedAt: new Date()
                            },
                            include: {
                                user: true
                            }
                        });
                        if (!updatedInvestment) {
                            continue;
                        }
                        alert_event_1.alertEmitter.emit("investment:close", {
                            investment: updatedInvestment,
                            user: updatedInvestment.user
                        });
                    }
                    continue; // Move to the next investment
                } // End Duration Check
                // --- Calculate Daily Profit for ongoing investments ---
                const remainingDays = investment.duration - investment.daysCompleted;
                if (remainingDays <= 0) {
                    await prisma_1.default.investment.update({
                        where: {
                            id: investment.id
                        },
                        data: {
                            investmentStatus: index_1.InvestmentStatus.CLOSED
                        }
                    });
                    continue; // Avoid division by zero and handle unexpected state
                }
                const totalReturnsLeft = expectedTotalReturns.sub(currentTotalReturns);
                const avgDailyReturn = totalReturnsLeft.div(remainingDays);
                // Apply fluctuation factor (consider if this randomness is truly desired)
                const FLUCTUATION_MIN = 0.8;
                const FLUCTUATION_MAX = 1.2;
                const fluctuationFactor = FLUCTUATION_MIN + Math.random() * (FLUCTUATION_MAX - FLUCTUATION_MIN);
                // Calculate daily return using Decimal, ensure non-negative, round appropriately
                let dailyReturnDecimal = avgDailyReturn.mul(fluctuationFactor);
                if (dailyReturnDecimal.isNegative()) {
                    dailyReturnDecimal = new decimal_js_1.default(0);
                }
                // Ensure daily return doesn't exceed remaining total returns left (can happen with fluctuation)
                if (dailyReturnDecimal.greaterThan(totalReturnsLeft) && !totalReturnsLeft.isNegative()) {
                    dailyReturnDecimal = totalReturnsLeft;
                }
                // Round to 2 decimal places *after* calculations
                dailyReturnDecimal = dailyReturnDecimal.toDecimalPlaces(2);
                // --- Distribute Daily Profit within a Transaction ---
                await prisma_1.default.$transaction(async (tx) => {
                    const profit = await tx.profit.create({
                        data: {
                            userId: user.id,
                            accountId: user.account.id,
                            investmentId: investment.id,
                            amount: dailyReturnDecimal.toDecimalPlaces(2).toNumber(),
                            status: investment.autocompounded ? index_1.ProfitStatus.FROZEN : index_1.ProfitStatus.DISTRIBUTED,
                            ...(!investment.autocompounded && {
                                distributedAt: new Date()
                            })
                        }
                    });
                    await tx.transaction.create({
                        data: {
                            actualAmountInUSD: profit.amount,
                            amountInCurrency: profit.amount,
                            amountInUSD: profit.amount,
                            charge: 0,
                            currency: "USD",
                            description: `Daily return on ${investment.investmentName} (${investment.investmentTier} Tier)`,
                            investmentId: investment.id,
                            isWireTransfer: false,
                            isGiftCard: false,
                            rate: 1,
                            transactionStatus: index_1.TransactionStatus.SUCCESSFUL,
                            transactionType: index_1.TransactionType.PROFIT,
                            userId: investment.userId
                        }
                    });
                    let updatedCurrentCompoundedAmount = investment.currentCompoundedAmount;
                    if (investment.autocompounded) {
                        updatedCurrentCompoundedAmount = currentCompoundedAmount
                            .add(dailyReturnDecimal)
                            .toDecimalPlaces(2)
                            .toNumber();
                    }
                    else {
                        await tx.user.update({
                            where: { id: user.id },
                            data: {
                                account: {
                                    update: {
                                        walletBalance: userWalletBalance
                                            .add(dailyReturnDecimal)
                                            .toDecimalPlaces(2)
                                            .toNumber()
                                    }
                                }
                            }
                        });
                    }
                    await tx.investment.update({
                        where: {
                            id: investment.id
                        },
                        data: {
                            currentCompoundedAmount: updatedCurrentCompoundedAmount,
                            currentTotalReturns: currentTotalReturns
                                .add(dailyReturnDecimal)
                                .toDecimalPlaces(2)
                                .toNumber(),
                            lastProfitAmount: profit.amount,
                            daysCompleted: {
                                increment: 1
                            },
                            lastProfitDistributedAt: new Date()
                        }
                    });
                    await tx.notification.create({
                        data: {
                            userId: user.id,
                            title: "Daily Return Received",
                            description: `Investment: ${investment.investmentName}\nTier: ${investment.investmentTier}\nAmount: $${profit.amount.toLocaleString()}`
                        }
                    });
                }); // End Transaction for Daily Profit
            }
            catch (error) {
                profitError(investment.id, error);
                // Continue to the next investment
            }
        } // End For Loop
        end();
    }
    catch (error) {
        logError(error);
    }
}
function getStartOfTodayUTC() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
function useLogger() {
    return {
        start: () => logger_1.default.info("Starting profit distribution cycle."),
        end: () => logger_1.default.info("Profit distribution cycle finished."),
        noInvestments: () => logger_1.default.info("No eligible investments found for profit distribution today."),
        logError: (error) => logger_1.default.error("Error during profit distribution setup or initial fetch.", error),
        userNotFound: (investmentId) => logger_1.default.warn(`User or account not found for investment ${investmentId}. Skipping.`),
        closeInvestment: (investmentId) => logger_1.default.info(`Closing completed investment ${investmentId} (no shortfall).`),
        profitError: (investmentId, error) => logger_1.default.error(`Failed to process profit distribution for investment ${investmentId}:`, error)
    };
}
