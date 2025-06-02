import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { ApiResponse } from "#src/types/api-response";
import { GET_REQUEST_DATA_LIMIT } from "#src/utils/constants";

export interface DeleteNotificationsApiResponse extends ApiResponse {
  deleteCount: number;
}

export default api(
  {
    group: "/users/me",
    path: "/notifications{/:notification_id}",
    method: "delete"
  },
  defineHandler(async (req) => {
    const userId = req.user!.id;

    const { notification_id } = req.params;

    if (notification_id === "ALL") {
      const { count } = await prisma.notification.deleteMany({
        where: { userId }
      });

      const payload: DeleteNotificationsApiResponse = {
        success: true,
        message: "All notifications deleted",
        deleteCount: count
      };

      return payload;
    }

    const notificationIds = notification_id
      .split(",")
      .map((id) => id.trim())
      .slice(0, GET_REQUEST_DATA_LIMIT);

    const { count } = await prisma.notification.deleteMany({
      where: {
        id: {
          in: notificationIds
        }
      }
    });

    const word =
      notificationIds.length === 0 || notificationIds.length > 1 ? "notifications" : "notification";

    const payload: DeleteNotificationsApiResponse = {
      success: true,
      message: `${notificationIds.length} ${word} deleted.`,
      deleteCount: count
    };
    return payload;
  })
);
