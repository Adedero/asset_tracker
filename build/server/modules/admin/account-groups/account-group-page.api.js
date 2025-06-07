import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/admins/me",
    path: "/pages/account-groups/:account_group_id"
}, defineHandler(async (req) => {
    const { account_group_id } = req.params;
    const [accountGroup, currencies] = await Promise.all([
        prisma.accountGroup.findUnique({
            where: { id: account_group_id }
        }),
        prisma.currency.findMany()
    ]);
    if (!accountGroup) {
        throw HttpException.notFound("Account group not found");
    }
    const payload = {
        success: true,
        message: "Successful",
        accountGroup,
        currencies
    };
    return payload;
}));
