import prisma from "#src/lib/prisma/prisma";
import { compare, hash } from "bcrypt";

type Passwords = {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

export default async function changePassword(
  userId: string,
  password: Passwords
): Promise<{ success: boolean; message: string }> {
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true }
  });

  if (!user) {
    return {
      success: false,
      message: "User not found"
    };
  }

  const isMatch = await compare(oldPassword, user.password);
  if (!isMatch) {
    return {
      success: false,
      message: "Incorrect old password. Enter the correct password and try again"
    };
  }

  const hashedPassword = await hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return {
    success: true,
    message: "Password changed successfully"
  };
}
