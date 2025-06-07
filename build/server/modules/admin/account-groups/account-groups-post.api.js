import { api } from "#src/lib/api/api";
import { defineHandler, defineValidator } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { z } from "zod";
const Schema = z.object({
    name: z.string({ message: "Name is requuired" }).trim(),
    description: z.string().trim().optional(),
    currencies: z.array(z.object({
        id: z.string({ message: "Currency ID is required" }),
        walletAddress: z.string({ message: "Currency wallet address is required" }),
        walletAddressNetwork: z
            .string({ message: "Currency wallet address network must be a string" })
            .optional()
    }), { message: "Currencies must be an array" })
});
export default api({
    group: "/admins/me",
    path: "/account-groups",
    method: "post",
    middleware: defineValidator("body", Schema)
}, defineHandler(async (req) => {
    const data = req.validatedBody;
    const existingAccountGroup = await prisma.accountGroup.findUnique({
        where: { name: data.name }
    });
    if (existingAccountGroup) {
        throw HttpException.badRequest("A account group with this name already exists");
    }
    const accountGroup = await prisma.accountGroup.create({
        data
    });
    return {
        statusCode: 201,
        success: true,
        message: "Account group created successfully",
        accountGroup
    };
}));
