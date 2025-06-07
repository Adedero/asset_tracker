"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = verifyOTP;
const prisma_1 = __importDefault(require("#src/lib/prisma/prisma"));
const token_1 = require("#src/utils/token");
const bcrypt_1 = require("bcrypt");
async function verifyOTP(options) {
    const { userId, email, otp, withVerificationLink = false } = options;
    let query = null;
    if (userId) {
        query = { id: userId, ...(query || {}) };
    }
    if (email) {
        query = { email, ...(query || {}) };
    }
    if (!query) {
        return {
            valid: false,
            message: "Invalid request. Please try again."
        };
    }
    const user = await prisma_1.default.user.findUnique({
        where: query
    });
    if (!user) {
        return {
            valid: false,
            message: "Account not found."
        };
    }
    let isValid = false;
    if (!withVerificationLink) {
        const tokenData = await prisma_1.default.token.findUnique({
            where: { userId },
            select: { value: true, expiresIn: true }
        });
        if (!tokenData || (0, token_1.isDateExpired)(tokenData?.expiresIn)) {
            return {
                valid: false,
                message: "Invalid or expired OTP."
            };
        }
        isValid = await (0, bcrypt_1.compare)(otp, tokenData.value);
    }
    else {
        const tokenData = await prisma_1.default.token.findUnique({
            where: { userId, value: otp },
            select: { value: true, expiresIn: true }
        });
        if (!tokenData || (0, token_1.isDateExpired)(tokenData?.expiresIn)) {
            return {
                valid: false,
                message: "Invalid or expired OTP."
            };
        }
        isValid = otp === tokenData.value;
    }
    return {
        valid: isValid,
        message: isValid ? "OTP verified" : "Invalid or expired OTP.",
        user
    };
}
