"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const constants_1 = require("#src/utils/constants");
const zod_1 = require("zod");
const get_updated_currency_data_js_1 = __importDefault(require("../currencies/get-updated-currency-data.js"));
const Schema = zod_1.z.object({
    symbol: zod_1.z.string({ message: "Currency symbol is required" }).toUpperCase(),
    amount: zod_1.z.string({ message: "Invalid amount" }).transform((amt) => Number(amt))
});
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "transactions/deposit/initialize",
    method: "get",
    middleware: (0, handlers_1.defineValidator)("query", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const { symbol, amount } = req.validatedQuery;
    if (amount < constants_1.MIN_DEPOSIT_AMOUNT) {
        throw http_1.HttpException.badRequest(`Amount must not be less than $${constants_1.MIN_DEPOSIT_AMOUNT.toLocaleString()}`);
    }
    if (amount > constants_1.MAX_DEPOSIT_AMOUNT) {
        throw http_1.HttpException.badRequest(`Amount must not be more than $${constants_1.MAX_DEPOSIT_AMOUNT.toLocaleString()}`);
    }
    const user = await prisma_1.default.user.findUnique({
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
        throw http_1.HttpException.notFound("User not found");
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
    let currency = await prisma_1.default.currency.findUnique({
        where: { abbr: symbol }
    });
    if (!currency) {
        throw http_1.HttpException.notFound("Currency not found");
    }
    const selectedCurrency = user.accountGroup?.currencies.find((curr) => curr.id === currency?.id);
    const depositAccountWalletAddress = selectedCurrency?.walletAddress || currency.walletAddress;
    const depositAccountWalletAddressNetwork = selectedCurrency?.walletAddressNetwork || currency.walletAddressNetwork || undefined;
    const updatedCurrency = await (0, get_updated_currency_data_js_1.default)(currency);
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
