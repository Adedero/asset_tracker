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
const index_1 = require("#src/prisma-gen/index");
const Schema = zod_1.z.object({
    unfreezeInvestments: zod_1.z.boolean().default(true)
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/users/:user_id/unban",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { user_id } = req.params;
    const { unfreezeInvestments } = req.validatedBody;
    const user = await prisma_1.default.user.findUnique({
        where: {
            id: user_id
        }
    });
    if (!user) {
        throw http_1.HttpException.notFound("User not found");
    }
    const promises = [
        prisma_1.default.user.update({
            where: { id: user_id },
            data: {
                isBanned: false,
                ban: {
                    update: {
                        active: false
                    }
                }
            }
        })
    ];
    if (unfreezeInvestments) {
        promises.push(prisma_1.default.investment.updateMany({
            where: { userId: user_id, investmentStatus: index_1.InvestmentStatus.PAUSED },
            data: {
                investmentStatus: index_1.InvestmentStatus.OPEN
            }
        }));
    }
    await prisma_1.default.$transaction(promises);
    return {
        success: true,
        message: "User unbanned successfully"
    };
}));
