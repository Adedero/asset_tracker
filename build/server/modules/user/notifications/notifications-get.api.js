"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const http_1 = require("#src/lib/api/http");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const constants_1 = require("#src/utils/constants");
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/notifications{/:notification_id}",
    method: "get"
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const notification_id = req.params.notification_id?.toString();
    const parsedQuery = req.parsedQuery;
    if (notification_id) {
        const notification = await prisma_1.default.notification.findUnique({
            where: { id: notification_id, userId }
        });
        if (!notification) {
            throw http_1.HttpException.notFound("Not found");
        }
        if (!notification.isRead) {
            await prisma_1.default.notification.update({
                where: { id: notification.id },
                data: { isRead: true }
            });
        }
        const payload = {
            success: true,
            message: "Successful",
            notification
        };
        return payload;
    }
    const notifications = await prisma_1.default.notification.findMany({
        where: { userId, ...(parsedQuery?.where || {}) },
        orderBy: parsedQuery?.sort,
        take: parsedQuery?.take || constants_1.GET_REQUEST_DATA_LIMIT,
        skip: parsedQuery?.skip
    });
    const unreadNotifications = notifications.filter((n) => n.isRead === false).map((n) => n.id);
    if (unreadNotifications.length) {
        await prisma_1.default.notification.updateMany({
            where: {
                id: {
                    in: unreadNotifications
                }
            },
            data: {
                isRead: true
            }
        });
    }
    const payload = {
        success: true,
        message: "Successful",
        notifications
    };
    return payload;
}));
