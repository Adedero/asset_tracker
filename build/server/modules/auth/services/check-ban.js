export function isUserBanned(user) {
    if (!user.ban) {
        return !!user.isBanned;
    }
    const ban = user.ban;
    if (!ban.active)
        return false;
    return !(ban.expiresAt && new Date() > new Date(ban.expiresAt));
}
