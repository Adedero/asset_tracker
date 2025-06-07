"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("#src/lib/api/api");
const handlers_1 = require("#src/lib/api/handlers");
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
exports.default = (0, api_1.api)({
    group: "/admins/me",
    path: "/account-groups/:account_group_id",
    method: "delete"
}, (0, handlers_1.defineHandler)(async (req) => {
    const { account_group_id } = req.params;
    const accountGroup = await prisma_1.default.accountGroup.delete({
        where: { id: account_group_id }
    });
    return {
        success: true,
        message: "Account group deleted successfully",
        accountGroup
    };
}));
