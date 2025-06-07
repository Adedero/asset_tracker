import prisma from "#src/lib/prisma/prisma";
import { isDateExpired } from "#src/utils/token";
import { compare } from "bcrypt";
export default async function verifyOTP(options) {
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
    const user = await prisma.user.findUnique({
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
        const tokenData = await prisma.token.findUnique({
            where: { userId },
            select: { value: true, expiresIn: true }
        });
        if (!tokenData || isDateExpired(tokenData?.expiresIn)) {
            return {
                valid: false,
                message: "Invalid or expired OTP."
            };
        }
        isValid = await compare(otp, tokenData.value);
    }
    else {
        const tokenData = await prisma.token.findUnique({
            where: { userId, value: otp },
            select: { value: true, expiresIn: true }
        });
        if (!tokenData || isDateExpired(tokenData?.expiresIn)) {
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
