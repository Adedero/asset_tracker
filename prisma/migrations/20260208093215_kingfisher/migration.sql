/*
  Warnings:

  - You are about to drop the column `userTiers` on the `InvestmentPlan` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_InvestmentPlanToTier" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_InvestmentPlanToTier_A_fkey" FOREIGN KEY ("A") REFERENCES "InvestmentPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_InvestmentPlanToTier_B_fkey" FOREIGN KEY ("B") REFERENCES "Tier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InvestmentPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "tiers" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_InvestmentPlan" ("createdAt", "id", "image", "name", "slug", "tiers", "updatedAt") SELECT "createdAt", "id", "image", "name", "slug", "tiers", "updatedAt" FROM "InvestmentPlan";
DROP TABLE "InvestmentPlan";
ALTER TABLE "new_InvestmentPlan" RENAME TO "InvestmentPlan";
CREATE UNIQUE INDEX "InvestmentPlan_slug_key" ON "InvestmentPlan"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_InvestmentPlanToTier_AB_unique" ON "_InvestmentPlanToTier"("A", "B");

-- CreateIndex
CREATE INDEX "_InvestmentPlanToTier_B_index" ON "_InvestmentPlanToTier"("B");
