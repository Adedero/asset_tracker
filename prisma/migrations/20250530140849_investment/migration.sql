-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Investment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "autocompounded" BOOLEAN NOT NULL,
    "investmentStatus" TEXT NOT NULL DEFAULT 'OPEN',
    "initialDeposit" REAL NOT NULL,
    "expectedReturnRate" REAL NOT NULL,
    "autocompoundedReturnRate" REAL,
    "expectedTotalReturns" REAL NOT NULL,
    "currentTotalReturns" REAL NOT NULL DEFAULT 0,
    "currentCompoundedAmount" REAL,
    "investmentName" TEXT NOT NULL,
    "investmentTier" TEXT NOT NULL,
    "minimumDeposit" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "terminationFee" REAL NOT NULL DEFAULT 0,
    "daysCompleted" INTEGER NOT NULL DEFAULT 0,
    "lastProfitDistributedAt" DATETIME,
    "lastProfitAmount" REAL,
    "hasTransferedProfitToWallet" BOOLEAN,
    "closedAt" DATETIME,
    "pausedAt" DATETIME,
    "pausedReason" TEXT,
    "terminatedAt" DATETIME,
    "terminator" TEXT,
    "terminationReason" TEXT,
    "terminationFeeApplied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Investment" ("autocompounded", "autocompoundedReturnRate", "closedAt", "createdAt", "currentCompoundedAmount", "currentTotalReturns", "daysCompleted", "duration", "expectedReturnRate", "expectedTotalReturns", "hasTransferedProfitToWallet", "id", "initialDeposit", "investmentName", "investmentStatus", "investmentTier", "lastProfitAmount", "lastProfitDistributedAt", "minimumDeposit", "pausedAt", "pausedReason", "terminatedAt", "terminationFee", "terminationFeeApplied", "terminationReason", "terminator", "updatedAt", "userId") SELECT "autocompounded", "autocompoundedReturnRate", "closedAt", "createdAt", "currentCompoundedAmount", "currentTotalReturns", "daysCompleted", "duration", "expectedReturnRate", "expectedTotalReturns", "hasTransferedProfitToWallet", "id", "initialDeposit", "investmentName", "investmentStatus", "investmentTier", "lastProfitAmount", "lastProfitDistributedAt", "minimumDeposit", "pausedAt", "pausedReason", "terminatedAt", "terminationFee", "terminationFeeApplied", "terminationReason", "terminator", "updatedAt", "userId" FROM "Investment";
DROP TABLE "Investment";
ALTER TABLE "new_Investment" RENAME TO "Investment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
