import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { MIN_DEPOSIT_AMOUNT, MAX_DEPOSIT_AMOUNT } from "#src/utils/constants";
import { z } from "zod";
import getUpdatedCurrencyData from "../currencies/get-updated-currency-data.js";
const Schema = z.object({
    symbol: z.string({ message: "Currency symbol is required" }).toUpperCase(),
    amount: z.string({ message: "Invalid amount" }).transform((amt) => Number(amt))
});
export default api({
    group: "/users/me",
    path: "transactions/deposit/initialize",
    method: "get",
    middleware: defineValidator("query", Schema)
}, defineHandler(async (req) => {
    const userId = req.user.id;
    const { symbol, amount } = req.validatedQuery;
    if (amount < MIN_DEPOSIT_AMOUNT) {
        throw HttpException.badRequest(`Amount must not be less than $${MIN_DEPOSIT_AMOUNT.toLocaleString()}`);
    }
    if (amount > MAX_DEPOSIT_AMOUNT) {
        throw HttpException.badRequest(`Amount must not be more than $${MAX_DEPOSIT_AMOUNT.toLocaleString()}`);
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            accountGroup: true,
            account: {
                select: { walletBalance: true }
            }
        }
    });
    if (!user) {
        throw HttpException.notFound("User not found");
    }
    if (symbol === "USD") {
        const wireTransferPayload = {
            success: true,
            message: "Successful",
            request: {
                amount: amount,
                currencyAbbr: symbol,
                isWireTransfer: true
            },
            result: amount,
            user: {
                walletBalance: user.account?.walletBalance || 0
            }
        };
        return wireTransferPayload;
    }
    let currency = await prisma.currency.findUnique({
        where: { abbr: symbol }
    });
    if (!currency) {
        throw HttpException.notFound("Currency not found");
    }
    const selectedCurrency = user.accountGroup?.currencies.find((curr) => curr.id === currency?.id);
    const depositAccountWalletAddress = selectedCurrency?.walletAddress || currency.walletAddress;
    const depositAccountWalletAddressNetwork = selectedCurrency?.walletAddressNetwork || currency.walletAddressNetwork || undefined;
    const updatedCurrency = await getUpdatedCurrencyData(currency);
    const result = amount / updatedCurrency.rate;
    const payload = {
        success: true,
        message: "Successful",
        request: {
            amount: amount,
            currencyAbbr: symbol,
            isWireTransfer: false
        },
        currency: updatedCurrency,
        result: result,
        user: {
            walletBalance: user.account?.walletBalance || 0
        },
        depositAccountData: {
            walletAddress: depositAccountWalletAddress,
            walletAddressNetwork: depositAccountWalletAddressNetwork
        }
    };
    return payload;
}));
