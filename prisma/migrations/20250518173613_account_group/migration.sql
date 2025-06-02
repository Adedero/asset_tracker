/*
  Warnings:

  - You are about to drop the column `walletAddress` on the `AccountGroup` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddressNetwork` on the `AccountGroup` table. All the data in the column will be lost.
  - Added the required column `currencies` to the `AccountGroup` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccountGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "currencies" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AccountGroup" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "AccountGroup";
DROP TABLE "AccountGroup";
ALTER TABLE "new_AccountGroup" RENAME TO "AccountGroup";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
