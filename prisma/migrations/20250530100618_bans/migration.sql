/*
  Warnings:

  - You are about to drop the column `devices` on the `Ban` table. All the data in the column will be lost.
  - You are about to alter the column `ipAddresses` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ban" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "bannedBy" TEXT NOT NULL,
    "areInvestmentsFrozen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ipAddresses" JSONB,
    CONSTRAINT "Ban_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ban" ("active", "areInvestmentsFrozen", "bannedBy", "createdAt", "expiresAt", "id", "ipAddresses", "reason", "updatedAt", "userId") SELECT "active", "areInvestmentsFrozen", "bannedBy", "createdAt", "expiresAt", "id", "ipAddresses", "reason", "updatedAt", "userId" FROM "Ban";
DROP TABLE "Ban";
ALTER TABLE "new_Ban" RENAME TO "Ban";
CREATE UNIQUE INDEX "Ban_userId_key" ON "Ban"("userId");
CREATE INDEX "Ban_userId_idx" ON "Ban"("userId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "accountGroupId" TEXT,
    "image" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "country" TEXT,
    "region" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ipAddresses" JSONB,
    "devices" JSONB,
    "isBanned" BOOLEAN DEFAULT false,
    CONSTRAINT "User_accountGroupId_fkey" FOREIGN KEY ("accountGroupId") REFERENCES "AccountGroup" ("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
INSERT INTO "new_User" ("accountGroupId", "address", "country", "createdAt", "devices", "email", "id", "image", "ipAddresses", "isBanned", "name", "password", "phoneNumber", "region", "role", "updatedAt", "verified") SELECT "accountGroupId", "address", "country", "createdAt", "devices", "email", "id", "image", "ipAddresses", "isBanned", "name", "password", "phoneNumber", "region", "role", "updatedAt", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
