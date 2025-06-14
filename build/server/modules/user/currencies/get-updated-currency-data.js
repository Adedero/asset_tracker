"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getUpdatedCurrencyData;
const env_1 = __importDefault(require("#src/utils/env"));
const logger_1 = __importDefault(require("#src/utils/logger"));
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const COINLAYER_API = env_1.default.get("COINLAYER_API");
const COINLAYER_API_KEY = env_1.default.get("COINLAYER_API_KEY");
async function getUpdatedCurrencyData(currency) {
    const ONE_DAY_AGO = new Date().getTime() - 24 * 60 * 60 * 1000;
    const updatedAt = currency.rateUpdatedAt ? new Date(currency.rateUpdatedAt).getTime() : null;
    if (!updatedAt || updatedAt < ONE_DAY_AGO) {
        //If it has been a day since the rate was updated
        //fetch the new rate from coinbase
        try {
            const uri = `${COINLAYER_API}/live?access_key=${COINLAYER_API_KEY}&target=USD&symbols=${currency.abbr.toUpperCase()}`;
            const response = await axios_1.default.get(uri);
            const data = response.data;
            if (!data.error) {
                const coinbaseRate = data.rates[currency.abbr.toUpperCase()];
                if (coinbaseRate) {
                    const updatedCurrency = await prisma_1.default.currency.update({
                        where: { id: currency.id },
                        data: {
                            rate: coinbaseRate,
                            rateUpdatedAt: new Date()
                        }
                    });
                    return updatedCurrency;
                }
                return currency;
            }
            return currency;
        }
        catch (error) {
            logger_1.default.error(`Failed to retrieve new rate for ${currency.name} from Coinbase`, error);
            return currency;
        }
    }
    else {
        return currency;
    }
}
