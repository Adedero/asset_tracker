import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { Notification } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";
import { GET_REQUEST_DATA_LIMIT } from "#src/utils/constants";

export interface NotificationsGetApiResponse extends ApiResponse {
  notifications: Notification[];
}

export interface NotificationGetApiResponse extends ApiResponse {
  notification: Notification;
}

export default api(
  {
    group: "/users/me",
    path: "/notifications{/:notification_id}",
    method: "get"
  },
  defineHandler(async (req) => {
    const userId = req.user!.id;
    const notification_id = req.params.notification_id?.toString();

    const parsedQuery: ParsedQuery<Notification> | undefined = req.parsedQuery;

    if (notification_id) {
      const notification = await prisma.notification.findUnique({
        where: { id: notification_id, userId }
      });

      if (!notification) {
        throw HttpException.notFound("Not found");
      }

      if (!notification.isRead) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { isRead: true }
        });
      }

      const payload: NotificationGetApiResponse = {
        success: true,
        message: "Successful",
        notification
      };

      return payload;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId, ...(parsedQuery?.where || {}) },
      orderBy: parsedQuery?.sort,
      take: parsedQuery?.take || GET_REQUEST_DATA_LIMIT,
      skip: parsedQuery?.skip
    });

    const unreadNotifications = notifications.filter((n) => n.isRead === false).map((n) => n.id);

    if (unreadNotifications.length) {
      await prisma.notification.updateMany({
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

    const payload: NotificationsGetApiResponse = {
      success: true,
      message: "Successful",
      notifications
    };

    return payload;
  })
);
