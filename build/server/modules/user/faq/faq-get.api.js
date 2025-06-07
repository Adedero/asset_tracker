"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/faq{/:faq_id_slug}",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const faq_id_slug = req.params.faq_id_slug;
    const parsedQuery = req.parsedQuery;
    if (faq_id_slug) {
        const faq = await prisma_1.default.faq.findFirst({
            where: {
                OR: [{ id: faq_id_slug }, { slug: faq_id_slug }]
            }
        });
        if (!faq) {
            throw http_1.HttpException.notFound("Not found");
        }
        const payload = {
            success: true,
            message: "Successful",
            faq
        };
        return payload;
    }
    const faq = await prisma_1.default.faq.findMany({
        /*  //@ts-ignore
        select: {
          ...(parsedQuery?.select || {}),
          ...(parsedQuery?.populate || {}),
          ...(parsedQuery?.exclude || {})
        }, */
        orderBy: parsedQuery?.sort,
        take: parsedQuery?.take,
        skip: parsedQuery?.skip
    });
    const payload = {
        success: true,
        message: "Successful",
        faq
    };
    return payload;
}));
