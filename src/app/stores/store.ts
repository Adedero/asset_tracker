import { DepositInitApiResponse } from "@/modules/user/transactions/deposit-init.api";
import { UserRole } from "@/prisma-gen";
import { StorageSerializers, useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  image?: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}

interface StoredSettings {
  error: null | {
    status?: number;
    message: string;
  };
}

interface DepositRequest {
  amount: number;
  isWireTransfer: boolean;
  currencyName: string;
  currencyAbbr: string;
  currencySymbol: string;
}

interface WithdrawalRequest {
  amount: number;
  walletAddress: string;
  walletAddressNetwork?: string;
  currency: {
    id: string;
    abbr: string;
  };
  user: {
    walletBalance: number;
  };
}

const useStore = defineStore("store", () => {
  const defaultUser: StoredUser = {
    id: "",
    name: "",
    email: "",
    verified: false,
    image: "",
    role: "USER",
    accessToken: "",
    refreshToken: ""
  };

  const user = useLocalStorage<StoredUser>("user", defaultUser);
  const settings = useLocalStorage<StoredSettings>("settings", { error: null });
  const depositRequest = useLocalStorage<DepositRequest | null>("depost-request", null, {
    serializer: StorageSerializers.object
  });
  const depositInitData = useLocalStorage<DepositInitApiResponse | null>(
    "deposit-init-data",
    null,
    { serializer: StorageSerializers.object }
  );
  const withdrawalRequest = useLocalStorage<WithdrawalRequest | null>("withdrawal-request", null, {
    serializer: StorageSerializers.object
  });

  return {
    user,
    settings,
    depositRequest,
    depositInitData,
    withdrawalRequest
  };
});

export default useStore;
