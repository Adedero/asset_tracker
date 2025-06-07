import env from "#src/utils/env";
import logger from "#src/utils/logger";
import axios from "axios";
import prisma from "#src/lib/prisma/prisma";
const COINLAYER_API = env.get("COINLAYER_API");
const COINLAYER_API_KEY = env.get("COINLAYER_API_KEY");
export default async function getUpdatedCurrencyData(currency) {
    const ONE_DAY_AGO = new Date().getTime() - 24 * 60 * 60 * 1000;
    const updatedAt = currency.rateUpdatedAt ? new Date(currency.rateUpdatedAt).getTime() : null;
    if (!updatedAt || updatedAt < ONE_DAY_AGO) {
        //If it has been a day since the rate was updated
        //fetch the new rate from coinbase
        try {
            const uri = `${COINLAYER_API}/live?access_key=${COINLAYER_API_KEY}&target=USD&symbols=${currency.abbr.toUpperCase()}`;
            const response = await axios.get(uri);
            const data = response.data;
            if (!data.error) {
                const coinbaseRate = data.rates[currency.abbr.toUpperCase()];
                if (coinbaseRate) {
                    const updatedCurrency = await prisma.currency.update({
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
            logger.error(`Failed to retrieve new rate for ${currency.name} from Coinbase`, error);
            return currency;
        }
    }
    else {
        return currency;
    }
}
