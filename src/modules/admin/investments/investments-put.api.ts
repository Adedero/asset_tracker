import { alertEmitter } from "#src/events/alert.event";
import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { InvestmentStatus } from "#src/prisma-gen/enums";
import { Investment } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";
import { z } from "zod";

const Schema = z.object({
  investmentStatus: z
    .enum(
      [
        InvestmentStatus.CLOSED,
        InvestmentStatus.OPEN,
        InvestmentStatus.PAUSED,
        InvestmentStatus.TERMINATED
      ],
      { message: "Invalid investment status provided" }
    )
    .optional(),
  pausedAt: z.coerce.date().nullable().optional(),
  pausedReason: z.string().nullable().optional(),
  terminatedAt: z.coerce.date().nullable().optional(),
  terminator: z.string().nullable().optional(),
  terminationReason: z.string().nullable().optional(),
  terminationFeeApplied: z.boolean().optional(),
  isPausing: z.boolean().optional()
});

interface InvestmentsPutApiResponse extends ApiResponse {
  investment: Investment;
}

export default api(
  {
    group: "/admins/me",
    path: "/investments/:investment_id",
    method: "put",
    middleware: defineValidator("body", Schema)
  },
  defineHandler<InvestmentsPutApiResponse>(async (req) => {
    const { investment_id } = req.params;
    const data = req.validatedBody as z.infer<typeof Schema>;

    const { isPausing } = data;

    delete data.isPausing;

    const investment = await prisma.investment.update({
      where: { id: investment_id },
      include: { user: true },
      data
    });

    if (!investment) {
      throw HttpException.notFound("Investment not found");
    }

    if (isPausing !== undefined) {
      alertEmitter.emit("investment:pause-toggle", { investment, user: investment.user });
    }

    return {
      success: true,
      message: "Investment updated successfully",
      investment
    };
  })
);
