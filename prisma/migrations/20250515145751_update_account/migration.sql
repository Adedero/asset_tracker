/*
  Warnings:

  - You are about to drop the column `accountNumber` on the `Account` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "walletBalance" REAL NOT NULL DEFAULT 0,
    "kycIdType" TEXT,
    "kycDocument" TEXT,
    "kycDocumentExt" TEXT,
    "kycStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "kycSubmittedAt" DATETIME,
    "kycVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("createdAt", "id", "kycDocument", "kycDocumentExt", "kycIdType", "kycStatus", "kycSubmittedAt", "kycVerifiedAt", "updatedAt", "userId", "walletBalance") SELECT "createdAt", "id", "kycDocument", "kycDocumentExt", "kycIdType", "kycStatus", "kycSubmittedAt", "kycVerifiedAt", "updatedAt", "userId", "walletBalance" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
