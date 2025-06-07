import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import getUpdatedCurrencyData from "./get-updated-currency-data.js";
export default api({
    group: "/users/me",
    path: "/currencies/:currency_id_or_symbol/rate",
    method: "get"
}, defineHandler(async (req) => {
    const { currency_id_or_symbol } = req.params;
    const currency = await prisma.currency.findFirst({
        where: {
            OR: [{ id: currency_id_or_symbol }, { abbr: currency_id_or_symbol }]
        }
    });
    if (!currency) {
        throw HttpException.notFound("Currency not found");
    }
    const updatedCurrency = await getUpdatedCurrencyData(currency);
    const payload = {
        success: true,
        message: "Successful",
        currency: updatedCurrency
    };
    return payload;
}));
