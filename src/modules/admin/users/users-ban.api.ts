import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { z } from "zod";
import { InvestmentStatus } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";

const Schema = z.object({
  banReason: z.string({ message: "Ban reason is required" }),
  banDuration: z.coerce.date({ message: "Ban duration must be a valid date" }).nullable(),
  freezeInvestments: z.boolean().default(true)
});

export default api(
  {
    group: "/admins/me",
    path: "/users/:user_id/ban",
    method: "put",
    middleware: defineValidator("body", Schema)
  },
  defineHandler<ApiResponse>(async (req) => {
    const { user_id } = req.params;
    const { banReason, banDuration, freezeInvestments } = req.validatedBody as z.infer<
      typeof Schema
    >;

    const user = await prisma.user.findUnique({
      where: {
        id: user_id
      }
    });

    if (!user) {
      throw HttpException.notFound("User not found");
    }

    const promises: any[] = [
      prisma.user.update({
        where: { id: user_id },
        data: {
          isBanned: true,
          ban: {
            upsert: {
              where: { userId: user_id },
              create: {
                reason: banReason,
                bannedBy: req.user!.id,
                areInvestmentsFrozen: freezeInvestments,
                expiresAt: banDuration,
                active: true,
                ...(user.ipAddresses && { ipAddresses: user.ipAddresses })
              },

              update: {
                reason: banReason,
                bannedBy: req.user!.id,
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
      promises.push(
        prisma.investment.updateMany({
          where: { userId: user_id },
          data: {
            investmentStatus: InvestmentStatus.PAUSED
          }
        })
      );
    }

    await prisma.$transaction(promises);

    return {
      success: true,
      message: "User banned successfully"
    };
  })
);
