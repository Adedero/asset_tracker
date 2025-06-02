import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ApiResponse } from "#src/types/api-response";

export default api(
  {
    group: "/admins/me",
    path: "/users/:user_id",
    method: "delete"
  },
  defineHandler<ApiResponse>(async (req) => {
    const { user_id } = req.params;

    throw HttpException.internal();

    await prisma.user.delete({
      where: {
        id: user_id
      }
    });

    return {
      success: true,
      message: "User deleted successfully"
    };
  })
);
