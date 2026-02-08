/*
  Warnings:

  - You are about to drop the `Tier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_InvestmentPlanToTier` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Tier_name_key";

-- DropIndex
DROP INDEX "_InvestmentPlanToTier_B_index";

-- DropIndex
DROP INDEX "_InvestmentPlanToTier_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Tier";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_InvestmentPlanToTier";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "UserTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_InvestmentPlanToUserTier" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_InvestmentPlanToUserTier_A_fkey" FOREIGN KEY ("A") REFERENCES "InvestmentPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_InvestmentPlanToUserTier_B_fkey" FOREIGN KEY ("B") REFERENCES "UserTier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "accountGroupId" TEXT,
    "tierId" TEXT,
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
    CONSTRAINT "User_accountGroupId_fkey" FOREIGN KEY ("accountGroupId") REFERENCES "AccountGroup" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT "User_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "UserTier" ("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
INSERT INTO "new_User" ("accountGroupId", "address", "country", "createdAt", "devices", "email", "id", "image", "ipAddresses", "isBanned", "lastLogin", "name", "password", "phoneNumber", "region", "role", "tierId", "updatedAt", "verified") SELECT "accountGroupId", "address", "country", "createdAt", "devices", "email", "id", "image", "ipAddresses", "isBanned", "lastLogin", "name", "password", "phoneNumber", "region", "role", "tierId", "updatedAt", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserTier_name_key" ON "UserTier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_InvestmentPlanToUserTier_AB_unique" ON "_InvestmentPlanToUserTier"("A", "B");

-- CreateIndex
CREATE INDEX "_InvestmentPlanToUserTier_B_index" ON "_InvestmentPlanToUserTier"("B");
