-- CreateTable
CREATE TABLE "User" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ipAddresses" TEXT,
    "devices" JSONB,
    CONSTRAINT "User_accountGroupId_fkey" FOREIGN KEY ("accountGroupId") REFERENCES "AccountGroup" ("id") ON DELETE NO ACTION ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "AccountGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "walletAddressNetwork" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresIn" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InvestmentPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "tiers" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Investment" (
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
    "terminatedAt" DATETIME,
    "terminator" TEXT,
    "terminationReason" TEXT,
    "terminationFeeApplied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Profit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountId" TEXT,
    "investmentId" TEXT,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'FROZEN',
    "distributedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profit_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "investmentId" TEXT,
    "transactionType" TEXT NOT NULL,
    "transactionStatus" TEXT NOT NULL,
    "amountInUSD" REAL NOT NULL,
    "charge" REAL NOT NULL DEFAULT 0,
    "actualAmountInUSD" REAL NOT NULL,
    "rate" REAL NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "amountInCurrency" REAL NOT NULL,
    "isWireTransfer" BOOLEAN NOT NULL DEFAULT false,
    "wireTransferEmail" TEXT,
    "depositWalletAddress" TEXT,
    "depositWalletAddressNetwork" TEXT,
    "withdrawalWalletAddress" TEXT,
    "withdrawalWalletAddressNetwork" TEXT,
    "approvedAt" DATETIME,
    "failedAt" DATETIME,
    "failReason" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "image" TEXT,
    "rate" TEXT NOT NULL,
    "rateUpdatedAt" DATETIME,
    "walletAddress" TEXT NOT NULL,
    "walletAddressNetwork" TEXT NOT NULL,
    "isAvailableForWithdrawal" BOOLEAN NOT NULL DEFAULT true,
    "withdrawalCharge" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Ban" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "ipAddresses" JSONB,
    "devices" JSONB,
    "bannedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Ban_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_key" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_accountNumber_key" ON "Account"("accountNumber");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_value_key" ON "Token"("value");

-- CreateIndex
CREATE INDEX "Token_userId_idx" ON "Token"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentPlan_slug_key" ON "InvestmentPlan"("slug");

-- CreateIndex
CREATE INDEX "Transaction_transactionStatus_isWireTransfer_idx" ON "Transaction"("transactionStatus", "isWireTransfer");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_symbol_key" ON "Currency"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_abbr_key" ON "Currency"("abbr");

-- CreateIndex
CREATE UNIQUE INDEX "Faq_slug_key" ON "Faq"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ban_userId_key" ON "Ban"("userId");

-- CreateIndex
CREATE INDEX "Ban_userId_idx" ON "Ban"("userId");
