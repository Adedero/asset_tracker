"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const http_1 = require("#src/lib/api/http");
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/faqs{/:faq_id}",
    method: "delete"
}, (0, handlers_1.defineHandler)(async (req) => {
    const { faq_id } = req.params;
    const faq = await prisma_1.default.faq.delete({
        where: { id: faq_id }
    });
    if (!faq) {
        throw http_1.HttpException.notFound("Faq not found");
    }
    const payload = {
        success: true,
        message: "Faq deleted successfully,",
        faq
    };
    return payload;
}));
