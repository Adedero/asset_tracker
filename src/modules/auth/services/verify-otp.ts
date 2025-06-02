import prisma from "#src/lib/prisma/prisma";
import { User } from "#src/prisma-gen/index";
import { UserWhereUniqueInput } from "#src/prisma-gen/models";
import { isDateExpired } from "#src/utils/token";
import { compare } from "bcrypt";

export interface VerifyOTPOptions {
  userId?: string;
  email?: string;
  otp: string;
  withVerificationLink?: boolean;
}

export interface VerifyOTPResponse {
  valid: boolean;
  message: string;
  user?: User;
}

export default async function verifyOTP(options: VerifyOTPOptions): Promise<VerifyOTPResponse> {
  const { userId, email, otp, withVerificationLink = false } = options;

  let query: null | UserWhereUniqueInput = null;

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

  let isValid: boolean = false;

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
  } else {
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
