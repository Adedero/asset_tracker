"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const get_updated_currency_data_1 = __importDefault(require("./get-updated-currency-data"));
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/currencies/:currency_id_or_symbol/rate",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const { currency_id_or_symbol } = req.params;
    const currency = await prisma_1.default.currency.findFirst({
        where: {
            OR: [{ id: currency_id_or_symbol }, { abbr: currency_id_or_symbol }]
        }
    });
    if (!currency) {
        throw http_1.HttpException.notFound("Currency not found");
    }
    const updatedCurrency = await (0, get_updated_currency_data_1.default)(currency);
    const payload = {
        success: true,
        message: "Successful",
        currency: updatedCurrency
    };
    return payload;
}));
