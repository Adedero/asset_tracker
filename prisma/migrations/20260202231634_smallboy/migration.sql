-- CreateTable
CREATE TABLE "Tier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ipAddresses" JSONB,
    "devices" JSONB,
    "isBanned" BOOLEAN DEFAULT false,
    CONSTRAINT "User_accountGroupId_fkey" FOREIGN KEY ("accountGroupId") REFERENCES "AccountGroup" ("id") ON DELETE NO ACTION ON UPDATE CASCADE,
    CONSTRAINT "User_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier" ("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
INSERT INTO "new_User" ("accountGroupId", "address", "country", "createdAt", "devices", "email", "id", "image", "ipAddresses", "isBanned", "name", "password", "phoneNumber", "region", "role", "updatedAt", "verified") SELECT "accountGroupId", "address", "country", "createdAt", "devices", "email", "id", "image", "ipAddresses", "isBanned", "name", "password", "phoneNumber", "region", "role", "updatedAt", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Tier_name_key" ON "Tier"("name");
