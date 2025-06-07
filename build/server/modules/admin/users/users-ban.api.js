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
    banReason: zod_1.z.string({ message: "Ban reason is required" }),
    banDuration: zod_1.z.coerce.date({ message: "Ban duration must be a valid date" }).nullable(),
    freezeInvestments: zod_1.z.boolean().default(true)
});
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/users/:user_id/ban",
    method: "put",
    middleware: (0, handlers_1.defineValidator)("body", Schema)
}, (0, handlers_1.defineHandler)(async (req) => {
    const { user_id } = req.params;
    const { banReason, banDuration, freezeInvestments } = req.validatedBody;
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
                isBanned: true,
                ban: {
                    upsert: {
                        where: { userId: user_id },
                        create: {
                            reason: banReason,
                            bannedBy: req.user.id,
                            areInvestmentsFrozen: freezeInvestments,
                            expiresAt: banDuration,
                            active: true,
                            ...(user.ipAddresses && { ipAddresses: user.ipAddresses })
                        },
                        update: {
                            reason: banReason,
                            bannedBy: req.user.id,
                            areInvestmentsFrozen: freezeInvestments,
                            expiresAt: banDuration,
                            active: true
                        }
                    }
                }
            }
        })
    ];
    if (freezeInvestments) {
        promises.push(prisma_1.default.investment.updateMany({
            where: { userId: user_id },
            data: {
                investmentStatus: index_1.InvestmentStatus.PAUSED
            }
        }));
    }
    await prisma_1.default.$transaction(promises);
    return {
        success: true,
        message: "User banned successfully"
    };
}));
