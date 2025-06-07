"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const free_currency_1 = require("#src/utils/api/free-currency");
const zod_1 = require("zod");
const decimal_js_1 = __importDefault(require("decimal.js"));
const Schema = zod_1.z.array(zod_1.z.object({
    type: zod_1.z.string({ message: "Gift card type is required" }),
    country: zod_1.z.string({ message: "Gift card country is required" }),
    cardNumber: zod_1.z.string({ message: "Gift card number is required" }),
    pin: zod_1.z.string({ message: "Gift card pin is required" }),
    amount: zod_1.z
        .number({ message: "Gift card amount is required" })
        .min(0, { message: "Gift card amount must be greater than 0" }),
    currency: zod_1.z.enum(["USD", "CAD", "GBP"])
}));
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/transactions/deposit/giftcard/initialize",
    method: "post",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const cards = req.validatedBody;
    const rates = {
        USD: 1,
        CAD: 0,
        GBP: 0
    };
    let total = cards.reduce((acc, card) => {
        acc[card.currency] = (acc[card.currency] || 0) + card.amount;
        return acc;
    }, { USD: 0, CAD: 0, GBP: 0 });
    let totalUSD = total.USD;
    if (total.CAD > 0 || total.GBP > 0) {
        const { data } = await (0, free_currency_1.getExchangeRate)("CAD", "GBP");
        if (total.CAD > 0) {
            totalUSD += total.CAD / data.CAD;
            rates.CAD = data.CAD;
        }
        if (total.GBP > 0) {
            totalUSD += total.GBP / data.GBP;
            rates.GBP = data.GBP;
        }
    }
    const payload = {
        success: true,
        message: "Gift card deposit initialized successfully",
        total: new decimal_js_1.default(totalUSD).toDecimalPlaces(2).toNumber(),
        rates
    };
    return payload;
}));
