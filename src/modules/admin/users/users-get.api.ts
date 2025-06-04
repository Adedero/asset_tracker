import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { Ban, Account, User, AccountGroup } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";

export interface UsersGetApiResponse extends ApiResponse {
  users: Array<User & { accountGroup: { name: string; id: string } | null }>;
}

export interface UserWithAccountAndBan extends User {
  account: Account | null;
  ban: Ban | null;
  accountGroup: AccountGroup | null;
}

export interface UserGetApiResponse extends ApiResponse {
  user: UserWithAccountAndBan;
}

export default api(
  {
    group: "/admins/me",
    path: "/users{/:user_id}",
    method: "get"
  },
  defineHandler(async (req) => {
    const user_id = req.params.user_id?.toString();

    const parsedQuery: ParsedQuery<User> | undefined = req.parsedQuery;

    if (user_id) {
      const user = await prisma.user.findUnique({
        where: { id: user_id },
        include: {
          account: true,
          ban: true,
          accountGroup: true,
          ...(parsedQuery?.populate || {})
        }
      });

      if (!user) {
        throw HttpException.notFound("User not found");
      }

      const payload: UserGetApiResponse = {
        success: true,
        message: "Successful",
        user
      };

      return payload;
    }

    const users = await prisma.user.findMany({
      //@ts-ignore
      where: { ...(parsedQuery?.where || {}) },
      include: {
        accountGroup: {
          select: { name: true, id: true }
        }
      },
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

    const payload: UsersGetApiResponse = {
      success: true,
      message: "Successful",
      //@ts-ignore
      users
    };

    return payload;
  })
);
