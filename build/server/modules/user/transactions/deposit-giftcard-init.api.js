import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { getExchangeRate } from "#src/utils/api/free-currency";
import { z } from "zod";
import Decimal from "decimal.js";
const Schema = z.array(z.object({
    type: z.string({ message: "Gift card type is required" }),
    country: z.string({ message: "Gift card country is required" }),
    cardNumber: z.string({ message: "Gift card number is required" }),
    pin: z.string({ message: "Gift card pin is required" }),
    amount: z
        .number({ message: "Gift card amount is required" })
        .min(0, { message: "Gift card amount must be greater than 0" }),
    currency: z.enum(["USD", "CAD", "GBP"])
}));
export default api({
    group: "/users/me",
    path: "/transactions/deposit/giftcard/initialize",
    method: "post",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
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
        const { data } = await getExchangeRate("CAD", "GBP");
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
        total: new Decimal(totalUSD).toDecimalPlaces(2).toNumber(),
        rates
    };
    return payload;
}));
