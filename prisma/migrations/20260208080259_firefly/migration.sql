-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InvestmentPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "tiers" JSONB,
    "userTiers" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_InvestmentPlan" ("createdAt", "id", "image", "name", "slug", "tiers", "updatedAt") SELECT "createdAt", "id", "image", "name", "slug", "tiers", "updatedAt" FROM "InvestmentPlan";
DROP TABLE "InvestmentPlan";
ALTER TABLE "new_InvestmentPlan" RENAME TO "InvestmentPlan";
CREATE UNIQUE INDEX "InvestmentPlan_slug_key" ON "InvestmentPlan"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
