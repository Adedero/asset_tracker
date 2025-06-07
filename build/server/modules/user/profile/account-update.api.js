import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
import { KycStatus } from "#src/prisma-gen/index";
import { z } from "zod";
const Schema = z.object({
    kycIdType: z.string().optional(),
    kycDocument: z.string().optional(),
    kycDocumentExt: z.string().optional(),
    kycStatus: z.enum([KycStatus.PENDING, KycStatus.VERIFIED, KycStatus.UNVERIFIED]).optional(),
    kycSubmittedAt: z.string().optional()
});
export default api({
    group: "/users/me",
    path: "/account",
    method: "put",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const data = req.validatedBody;
    const userId = req.user.id;
    await prisma.account.update({
        where: { userId },
        data: {
            ...data,
            kycSubmittedAt: data.kycSubmittedAt ? new Date(data.kycSubmittedAt) : undefined
        }
    });
    return {
        success: true,
        message: "Account updated successfully"
    };
}));
