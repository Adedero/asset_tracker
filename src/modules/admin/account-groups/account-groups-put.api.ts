import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { AccountGroup } from "#src/prisma-gen";
import { ApiResponse } from "#src/types/api-response";
import { z } from "zod";

const Schema = z.object({
  name: z.string({ message: "Name is requuired" }).trim().optional(),
  description: z.string().trim().optional(),
  currencies: z
    .array(
      z.object({
        id: z.string({ message: "Currency ID is required" }),
        walletAddress: z.string({ message: "Currency wallet address is required" }),
        walletAddressNetwork: z
          .string({ message: "Currency wallet address network must be a string" })
          .optional()
      }),
      { message: "Currencies must be an array" }
    )
    .optional()
});

export interface AccountGroupCreateApiResponse extends ApiResponse {
  accountGroup: AccountGroup;
}

export default api(
  {
    group: "/admins/me",
    path: "/account-groups/:account_group_id",
    method: "post",
    middleware: defineValidator("body", Schema)
  },
  defineHandler<AccountGroupCreateApiResponse>(async (req) => {
    const { account_group_id } = req.params;
    const data = req.validatedBody as z.infer<typeof Schema>;

    const existingAccountGroup = await prisma.accountGroup.findFirst({
      where: {
        AND: [{ name: data.name }, { id: { not: account_group_id } }]
      }
    });

    if (existingAccountGroup) {
      throw HttpException.badRequest("A account group with this name already exists");
    }

    const accountGroup = await prisma.accountGroup.update({
      where: { id: account_group_id },
      data
    });

    return {
      success: true,
      message: "Account group updated successfully",
      accountGroup
    };
  })
);
