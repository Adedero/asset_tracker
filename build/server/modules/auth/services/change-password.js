"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = changePassword;
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const bcrypt_1 = require("bcrypt");
async function changePassword(userId, password) {
    const { oldPassword, newPassword, newPasswordConfirm } = password;
    if (!userId) {
        return {
            success: false,
            message: "No user id provided"
        };
    }
    if (!oldPassword || !newPassword || !newPasswordConfirm) {
        return {
            success: false,
            message: "No data provided"
        };
    }
    if (newPassword === oldPassword) {
        return {
            success: false,
            message: "Your new password cannot be the same with your current password"
        };
    }
    if (newPassword.length < 8) {
        return {
            success: false,
            message: "Your new password must contain at least 8 characters"
        };
    }
    if (newPassword !== newPasswordConfirm) {
        return {
            success: false,
            message: "Passwords do not match. Please, confirm your new password and try again."
        };
    }
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true }
    });
    if (!user) {
        return {
            success: false,
            message: "User not found"
        };
    }
    const isMatch = await (0, bcrypt_1.compare)(oldPassword, user.password);
    if (!isMatch) {
        return {
            success: false,
            message: "Incorrect old password. Enter the correct password and try again"
        };
    }
    const hashedPassword = await (0, bcrypt_1.hash)(newPassword, 10);
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });
    return {
        success: true,
        message: "Password changed successfully"
    };
}
