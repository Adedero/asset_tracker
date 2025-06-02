-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Currency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "image" TEXT,
    "rate" REAL NOT NULL,
    "rateUpdatedAt" DATETIME,
    "walletAddress" TEXT NOT NULL,
    "walletAddressNetwork" TEXT,
    "isAvailableForWithdrawal" BOOLEAN NOT NULL DEFAULT true,
    "withdrawalCharge" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Currency" ("abbr", "createdAt", "id", "image", "isAvailableForWithdrawal", "name", "rate", "rateUpdatedAt", "symbol", "updatedAt", "walletAddress", "walletAddressNetwork", "withdrawalCharge") SELECT "abbr", "createdAt", "id", "image", "isAvailableForWithdrawal", "name", "rate", "rateUpdatedAt", "symbol", "updatedAt", "walletAddress", "walletAddressNetwork", "withdrawalCharge" FROM "Currency";
DROP TABLE "Currency";
ALTER TABLE "new_Currency" RENAME TO "Currency";
CREATE UNIQUE INDEX "Currency_abbr_key" ON "Currency"("abbr");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
