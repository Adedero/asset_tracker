import { User, Ban } from "@/prisma-gen/index";

export function isUserBanned(user: Partial<User> & { ban?: Ban | null }): boolean {
  if (!user.ban) {
    return !!user.isBanned;
  }

  const ban = user.ban;

  if (!ban.active) return false;

  return !(ban.expiresAt && new Date() > new Date(ban.expiresAt));
}
