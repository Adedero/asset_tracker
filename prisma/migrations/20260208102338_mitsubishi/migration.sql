/*
  Warnings:

  - You are about to drop the column `tierId` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tierId" TEXT,
    "walletBalance" REAL NOT NULL DEFAULT 0,
    "kycIdType" TEXT,
    "kycDocument" TEXT,
    "kycDocumentExt" TEXT,
    "kycStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "kycSubmittedAt" DATETIME,
    "kycVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Account_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "UserTier" ("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("createdAt", "id", "kycDocument", "kycDocumentExt", "kycIdType", "kycStatus", "kycSubmittedAt", "kycVerifiedAt", "updatedAt", "userId", "walletBalance") SELECT "createdAt", "id", "kycDocument", "kycDocumentExt", "kycIdType", "kycStatus", "kycSubmittedAt", "kycVerifiedAt", "updatedAt", "userId", "walletBalance" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
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
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ipAddresses" JSONB,
    "devices" JSONB,
    "isBanned" BOOLEAN DEFAULT false,
    CONSTRAINT "User_accountGroupId_fkey" FOREIGN KEY ("accountGroupId") REFERENCES "AccountGroup" ("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
INSERT INTO "new_User" ("accountGroupId", "address", "country", "createdAt", "devices", "email", "id", "image", "ipAddresses", "isBanned", "lastLogin", "name", "password", "phoneNumber", "region", "role", "updatedAt", "verified") SELECT "accountGroupId", "address", "country", "createdAt", "devices", "email", "id", "image", "ipAddresses", "isBanned", "lastLogin", "name", "password", "phoneNumber", "region", "role", "updatedAt", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
