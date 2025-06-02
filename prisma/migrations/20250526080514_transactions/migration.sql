-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "giftCardData" JSONB;
ALTER TABLE "Transaction" ADD COLUMN "isGiftCard" BOOLEAN DEFAULT false;
