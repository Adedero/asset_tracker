"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const constants_1 = require("#src/utils/constants");
exports.default = (0, api_1.api)({
    group: "/users/me",
    path: "/notifications{/:notification_id}",
    method: "delete"
}, (0, handlers_1.defineHandler)(async (req) => {
    const userId = req.user.id;
    const { notification_id } = req.params;
    if (notification_id === "ALL") {
        const { count } = await prisma_1.default.notification.deleteMany({
            where: { userId }
        });
        const payload = {
            success: true,
            message: "All notifications deleted",
            deleteCount: count
        };
        return payload;
    }
    const notificationIds = notification_id
        .split(",")
        .map((id) => id.trim())
        .slice(0, constants_1.GET_REQUEST_DATA_LIMIT);
    const { count } = await prisma_1.default.notification.deleteMany({
        where: {
            id: {
                in: notificationIds
            }
        }
    });
    const word = notificationIds.length === 0 || notificationIds.length > 1 ? "notifications" : "notification";
    const payload = {
        success: true,
        message: `${notificationIds.length} ${word} deleted.`,
        deleteCount: count
    };
    return payload;
}));
