declare global {
  namespace PrismaJson {
    type InvestmentTier = {
      name: string;
      minimumDeposit: number;
      duration: number;
      expectedReturnRate: number;
      terminationFee: number;
    };

    type AccountGroupCurrencyData = {
      id: string;
      walletAddress: string;
      walletAddressNetwork?: string;
    };

    type GiftCardData = {
      cards: Array<{
        type: string;
        country: string;
        cardNumber: string;
        pin: string;
        amount: number;
        amountRetrieved?: number;
        rateUsed?: number;
        currency: "USD" | "CAD" | "GBP";
      }>;
      totalInUSD: number;
      rates: {
        USD: number;
        CAD?: number;
        GBP?: number;
      };
    };

    type IpAddresses = string[];
  }
}

export {};
