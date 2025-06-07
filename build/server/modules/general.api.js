"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currency = void 0;
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
exports.default = (0, api_1.api)({ path: "investment-plans", method: "post" }, (0, handlers_1.defineHandler)(async (req) => {
    const data = req.body;
    const plan = await prisma_1.default.investmentPlan.create({ data });
    return { plan };
}));
exports.currency = (0, api_1.api)({ path: "currencies", method: "post" }, (0, handlers_1.defineHandler)(async (req) => {
    const data = req.body;
    const plan = await prisma_1.default.currency.create({ data });
    return { plan };
}));
