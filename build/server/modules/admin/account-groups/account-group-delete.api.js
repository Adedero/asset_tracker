import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import prisma from "#src/lib/prisma/prisma";
export default api({
    group: "/admins/me",
    path: "/account-groups/:account_group_id",
    method: "delete"
}, defineHandler(async (req) => {
    const { account_group_id } = req.params;
    const accountGroup = await prisma.accountGroup.delete({
        where: { id: account_group_id }
    });
    return {
        success: true,
        message: "Account group deleted successfully",
        accountGroup
    };
}));
