"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExchangeRate = getExchangeRate;
const axios_1 = __importDefault(require("axios"));
const env_1 = __importDefault(require("../env"));
const logger_1 = __importDefault(require("../logger"));
async function getExchangeRate(...args) {
    const api = env_1.default.get("FREE_CURRENCY_API");
    const apikey = env_1.default.get("FREE_CURRENCY_API_KEY");
    if (!api || !apikey) {
        throw new Error("Free Currency API URL or API key is not set in environment variables.");
    }
    const url = new URL(api);
    url.searchParams.set("apikey", apikey);
    url.searchParams.set("currencies", args.join(","));
    try {
        const response = await axios_1.default.get(url.toString());
        return response.data;
    }
    catch (error) {
        logger_1.default.error("Failed to fetch exchange rates", error);
        throw new Error(`Failed to fetch exchange rates: ${error.message}`);
    }
}
