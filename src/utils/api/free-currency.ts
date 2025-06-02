import axios from "axios";
import env from "../env.js";
import logger from "../logger.js";

export type ExchangeRateData<T extends string[]> = {
  [P in T[number]]: number;
};

export interface FreeCurrencyApiResponse<T extends string[]> {
  meta: Record<string, any>;
  data: ExchangeRateData<T>;
}

export async function getExchangeRate<T extends string[]>(
  ...args: T
): Promise<FreeCurrencyApiResponse<T>> {
  const api = env.get<string>("FREE_CURRENCY_API");
  const apikey = env.get<string>("FREE_CURRENCY_API_KEY");
  if (!api || !apikey) {
    throw new Error("Free Currency API URL or API key is not set in environment variables.");
  }
  const url = new URL(api);
  url.searchParams.set("apikey", apikey);
  url.searchParams.set("currencies", args.join(","));

  try {
    const response = await axios.get(url.toString());
    return response.data as FreeCurrencyApiResponse<T>;
  } catch (error) {
    logger.error("Failed to fetch exchange rates", error);
    throw new Error(`Failed to fetch exchange rates: ${(error as Error).message}`);
  }
}
