"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const zod_1 = require("zod");
const Schema = zod_1.z.object({
    slug: zod_1.z.string({ message: "Slug is required" }).trim(),
    title: zod_1.z.string({ message: "Title is required" }).trim(),
    description: zod_1.z.string({ message: "Description is required" }).trim()
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/faqs/:faq_id_or_slug",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const data = req.validatedBody;
    const { faq_id_or_slug } = req.params;
    const existingFaq = await prisma_1.default.faq.findFirst({
        where: {
            NOT: {
                OR: [{ id: faq_id_or_slug }, { slug: faq_id_or_slug }]
            },
            OR: [{ title: data.title }, { slug: data.slug }]
        }
    });
    if (existingFaq) {
        throw http_1.HttpException.badRequest("A faq with this name or slug already exists");
    }
    const faq = await prisma_1.default.faq.updateManyAndReturn({
        where: {
            OR: [{ id: faq_id_or_slug }, { slug: faq_id_or_slug }]
        },
        data
    });
    return {
        statusCode: 201,
        success: true,
        message: "Faq updated successfully",
        faq: faq[0]
    };
}));
