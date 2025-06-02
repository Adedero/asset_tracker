<script setup lang="ts">
import { onMounted, ref } from "vue";
import { $fetch, useFetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import { CurrenciesGetApiResponse } from "@/modules/user/currencies/currencies-get.api";
import { Currency } from "@/prisma-gen";
import useStore from "@/app/stores/store";
import { useRouter } from "vue-router";
import { dollar } from "@/app/utils/helpers";
import { AVG_PROCESSING_TIME, MIN_ACCOUNT_BALANCE } from "@/utils/constants";
import { WithdrawalInitApiResponse } from "@/modules/user/transactions/withrawal-init.api";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const toast = useToast();
const store = useStore();
const visible = ref(false);

const selectedCurrency = ref<Currency>();

const request = ref({
  amount: 0,
  walletAddress: "",
  walletAddressNetwork: ""
});

const copyWalletFromClipboard = async () => {
  try {
    request.value.walletAddress = await navigator.clipboard.readText();
  } catch (error) {
    console.error(error);
  }
};

const { isLoading, data, error, mutate } = useSWRV<CurrenciesGetApiResponse>(
  () => "/api/users/me/currencies?where=isAvailableForWithdrawal,true",
  $fetch
);

const {
  isFetching,
  data: initData,
  error: errorFetching,
  execute
} = useFetch(
  () => `/api/users/me/transactions/withdrawal/initialize?symbol=${selectedCurrency.value?.abbr}`,
  { immediate: false }
)
  .get()
  .json<WithdrawalInitApiResponse>();

const onCurrencyClick = async (currency: Currency) => {
  selectedCurrency.value = currency;
  /* @ts-expect-error */
  currency.isFetching = isFetching;
  await execute();
  visible.value = true;
  if (errorFetching.value || !initData.value?.success) return;
};

const initiateWithdrawal = () => {
  const required: Array<{ value: boolean; message: string }> = [
    {
      value: !!initData.value,
      message: "Something went wrong. Try again later."
    },
    {
      value: !!request.value.amount,
      message: "Enter the amount to withdraw"
    },
    {
      value: !!request.value.walletAddress,
      message: "Enter your wallet address"
    },
    {
      value: !!selectedCurrency.value,
      message: "Select a currency"
    },
    {
      value:
        (initData.value?.user.walletBalance || 0) - request.value.amount >= MIN_ACCOUNT_BALANCE,
      message: "You do not have sufficient funds to complete this withdrawal"
    }
  ];

  const fail = required.find((r) => r.value === false);

  if (fail) {
    toast.add({ severity: "error", detail: fail.message, life: 3000 });
    return;
  }

  store.withdrawalRequest = {
    ...request.value,
    currency: {
      id: selectedCurrency.value!.id,
      abbr: selectedCurrency.value!.abbr
    },
    user: {
      walletBalance: initData.value?.user.walletBalance || 0
    }
  };

  router.push({
    name: "user-withdrawal-validate"
  });
};

onMounted(() => {
  store.withdrawalRequest = null;
});
</script>

<template>
  <VueLayout name="user">
    <div class="h-full">
      <VNavbar />

      <Dialog
        v-model:visible="visible"
        modal
        :header="`${selectedCurrency?.abbr} Withdrawal`"
        class="w-80 md:w-96"
      >
        <VErrorMessage :error="errorFetching" class="my-2" />

        <div v-if="initData && selectedCurrency" class="flex-col-center gap-1">
          <div class="text-center">
            <p class="text-2xl font-semibold">{{ dollar.format(initData.user.walletBalance) }}</p>
            <p>Account Balance</p>
          </div>

          <form @submit.prevent="initiateWithdrawal" class="grid gap-3 w-full">
            <div class="grid gap-1">
              <label class="text-mute font-semibold text-sm">Amount</label>
              <InputGroup class="w-full *:dark:bg-slate-800">
                <InputGroupAddon>$</InputGroupAddon>
                <InputNumber
                  v-model="request.amount"
                  :max="initData.user.walletBalance - MIN_ACCOUNT_BALANCE"
                  placeholder="00.00"
                  :minFractionDigits="0"
                  :maxFractionDigits="2"
                  class="w-full *:dark:bg-slate-800"
                />
              </InputGroup>
              <small class="text-slate-500">
                A minimum of
                <span class="font-semibold">${{ MIN_ACCOUNT_BALANCE }}</span>
                must be left in your account after withdrawal
              </small>

              <Message
                v-if="initData.user.walletBalance < request.amount + MIN_ACCOUNT_BALANCE"
                size="small"
                severity="error"
              >
                You do not have sufficient funds to complete this withdrawal
              </Message>
            </div>

            <div class="grid gap-1">
              <label class="text-mute font-semibold text-sm">Currency</label>
              <InputGroup class="w-full *:dark:bg-slate-800">
                <InputGroupAddon>
                  <div class="w-5 rounded-full overlow-hidden">
                    <img :src="selectedCurrency.image || ''" class="w-full h-full object-cover" />
                  </div>
                </InputGroupAddon>
                <InputText
                  :value="selectedCurrency.name"
                  readonly
                  class="w-full *:dark:bg-slate-800"
                />
              </InputGroup>
            </div>

            <div class="grid gap-1">
              <label class="text-mute font-semibold text-sm">Your Wallet Address</label>
              <InputGroup class="w-full *:dark:bg-slate-800">
                <InputGroupAddon>
                  <span class="pi pi-wallet" />
                </InputGroupAddon>
                <InputText
                  v-model="request.walletAddress"
                  placeholder="e.g. 0x742d35Cc6634C0532925a3b44Bc454e4438f443"
                  class="w-full *:dark:bg-slate-800"
                />
                <InputGroupAddon>
                  <Button
                    @click="copyWalletFromClipboard"
                    severity="secondary"
                    icon="pi pi-clipboard"
                  />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div class="grid gap-1">
              <label class="text-mute font-semibold text-sm">Network</label>
              <InputGroup class="w-full *:dark:bg-slate-800">
                <InputGroupAddon>
                  <span class="pi pi-share-alt" />
                </InputGroupAddon>
                <InputText
                  v-model="request.walletAddressNetwork"
                  placeholder="e.g. Kraken"
                  class="w-full *:dark:bg-slate-800"
                />
              </InputGroup>
            </div>

            <div class="mt-2">
              <Button
                type="submit"
                :loading="isFetching"
                :disabled="isFetching || !request.amount || !request.walletAddress"
                label="Confirm"
                fluid
              />
            </div>
          </form>
        </div>
      </Dialog>

      <div class="mt-2 overflow-y-auto md:h-[calc(100dvh-8rem)]">
        <VPageLoader v-if="isLoading" />

        <div v-else-if="error" class="flex-center">
          <VErrorMessage :error should-retry @retry="mutate()" />
        </div>

        <div
          v-else-if="data"
          class="w-full grid gap-2 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]"
        >
          <VCard v-for="c in data.currencies" :key="c.name" :header="c.name">
            <div class="flex flex-col items-center gap-2">
              <img :src="c.image || ''" width="40" class="rounded-full" />
              <p class="font-medium">{{ c.abbr }}</p>
            </div>
            <Divider />

            <div class="text-center text-sm">
              <p class="text-center">Fixed Charge</p>
              <p class="font-medium">{{ dollar.format(c.withdrawalCharge) }}</p>
            </div>

            <div class="text-center text-sm">
              <p class="text-center">Average Processing Time</p>
              <p class="font-medium">{{ AVG_PROCESSING_TIME }}</p>
            </div>

            <Divider />

            <!-- @vue-ignore -->
            <Button
              @click="onCurrencyClick(c)"
              :loading="c.isFetching"
              size="small"
              :label="`Withdraw via ${c.abbr}`"
              fluid
            />
          </VCard>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
