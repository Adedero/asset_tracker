/*
  Warnings:

  - Added the required column `updatedAt` to the `Ban` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "isBanned" BOOLEAN DEFAULT false;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ban" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "ipAddresses" JSONB,
    "devices" JSONB,
    "bannedBy" TEXT NOT NULL,
    "areInvestmentsFrozen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Ban_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ban" ("active", "bannedBy", "createdAt", "devices", "expiresAt", "id", "ipAddresses", "reason", "userId") SELECT "active", "bannedBy", "createdAt", "devices", "expiresAt", "id", "ipAddresses", "reason", "userId" FROM "Ban";
DROP TABLE "Ban";
ALTER TABLE "new_Ban" RENAME TO "Ban";
CREATE UNIQUE INDEX "Ban_userId_key" ON "Ban"("userId");
CREATE INDEX "Ban_userId_idx" ON "Ban"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
