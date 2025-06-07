"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/investments/count",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const count = await prisma_1.default.investment.count({
        where: { userId }
    });
    return { success: true, count };
}));
