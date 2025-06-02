import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { KycStatus } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";
import { z } from "zod";

const Schema = z.object({
  walletBalance: z.number({ message: "Wallet balance must be a number" }).optional(),
  kycIdType: z.string({ message: "The KYC ID type must be a string" }).nullable().optional(),
  kycDocument: z
    .string({ message: "The KYC document type must be a string" })
    .nullable()
    .optional(),
  kycDocumentExt: z
    .string({ message: "The KYC document extension type must be a string" })
    .nullable()
    .optional(),
  kycStatus: z
    .enum([KycStatus.PENDING, KycStatus.VERIFIED, KycStatus.UNVERIFIED], {
      message: "The KYC status must be a string"
    })
    .optional(),
  kycSubmittedAt: z.coerce
    .date({ message: "The KYC submitted at must be a date" })
    .nullable()
    .optional(),
  kycVerifiedAt: z.coerce
    .date({ message: "The KYC verified at must be a date" })
    .nullable()
    .optional()
});

export type AccountUpdateApiResponse = ApiResponse & {
  success: boolean;
  message: string;
  account: Awaited<ReturnType<typeof prisma.account.update>>;
};

export default api(
  {
    group: "/admins/me",
    path: "/accounts/:account_id",
    method: "put",
    middleware: defineValidator("body", Schema)
  },
  defineHandler<AccountUpdateApiResponse>(async (req) => {
    const { account_id } = req.params;
    const data = req.validatedBody as z.infer<typeof Schema>;
    const account = await prisma.account.update({
      where: {
        id: account_id
      },
      data
    });

    return {
      success: true,
      message: "Account updated successfully",
      account
    };
  })
);
