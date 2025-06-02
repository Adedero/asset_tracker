<script setup lang="ts">
import { $fetch, useFetch } from "@/app/composables/use-fetch";
import { CurrencyRateApiResponse } from "@/modules/user/currencies/currencies-rate-get.api";
import useStore from "@/app/stores/store";
import useSWRV from "swrv";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { dollar } from "@/app/utils/helpers";
import { Transaction } from "@/prisma-gen";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const toast = useToast();
const store = useStore();
const visible = ref(false);
const transaction = ref<Partial<Transaction>>({});
const description = ref("");

const api = ref<string | null>(
  `/api/users/me/currencies/${store.withdrawalRequest!.currency.id}/rate`
);

const { isLoading, error, data, mutate } = useSWRV<CurrencyRateApiResponse>(
  () => api.value,
  $fetch
);

const actualAmountInUSD = computed(() => {
  return (store.withdrawalRequest?.amount || 0) - (data.value?.currency.withdrawalCharge || 0);
});

const amountInSelectedCurrency = computed(() => {
  const amount = store.withdrawalRequest?.amount || 0;
  const rate = data.value?.currency.rate || 0;
  if (!rate) return 0;
  return amount / rate;
});

const {
  isFetching,
  error: errorFetching,
  data: response,
  execute
} = useFetch(() => "/api/users/me/transactions/withdrawal", { immediate: false })
  .post(transaction)
  .json();

const completeWithdrawalRequest = async () => {
  if (!data.value?.currency || !store.withdrawalRequest) {
    toast.add({
      severity: "Error",
      summary: "Error",
      detail: "Failed to complete withdrawal request. Please, try again later."
    });
    return;
  }
  transaction.value = {
    userId: store.user.id,
    transactionType: "WITHDRAWAL",
    transactionStatus: "PENDING",
    amountInUSD: store.withdrawalRequest.amount,
    charge: data.value.currency.withdrawalCharge,
    actualAmountInUSD: store.withdrawalRequest.amount - data.value.currency.withdrawalCharge,
    rate: data.value.currency.rate,
    currency: data.value.currency.abbr,
    amountInCurrency: store.withdrawalRequest.amount / data.value.currency.rate,
    isWireTransfer: false,
    withdrawalWalletAddress: store.withdrawalRequest.walletAddress,
    withdrawalWalletAddressNetwork: store.withdrawalRequest.walletAddressNetwork,
    description: description.value
  };
  await execute();
  if (errorFetching.value || !response.value.success) return;

  api.value = null;
  store.withdrawalRequest = null;
  visible.value = true;
};

onMounted(() => {
  if (!store.withdrawalRequest) {
    router.push({ name: "user-withdrawal-initialize" });
    return;
  }
});

onUnmounted(() => {
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
        header="Deposit Request"
        class="max-w-[90dvw] md:w-96 dark:bg-slate-900"
        :closable="false"
      >
        <div class="flex flex-col items-center justify-center text-center">
          <span class="pi pi-check-circle text-emerald-500" style="font-size: 40px" />
          <p class="mt-4">Your withdrawal request has been received.</p>
          <p>
            The amount will be deducted from your account balance and your wallet address will be
            credited within 24 hours.
          </p>
        </div>

        <div class="mt-4">
          <Button @click="$router.push({ name: 'user-transactions' })" label="Continue" fluid />
        </div>
      </Dialog>

      <VPageLoader v-if="isLoading" />

      <VErrorMessage v-else-if="error" should-retry @retry="mutate" />

      <div
        v-else-if="store.withdrawalRequest && data"
        class="flex items-center justify-center py-4"
      >
        <VCard class="w-full max-w-[28rem] md:!p-6">
          <div class="text-center">
            <p class="text-2xl font-semibold">
              {{ dollar.format(store.withdrawalRequest.user.walletBalance) }}
            </p>
            <p>Account Balance</p>
          </div>

          <Divider />

          <div class="flex flex-col items-center justify-center gap-1">
            <img :src="data.currency.image || ''" width="40" />
            <p class="text-center font-semibold">{{ data.currency.name }} Withdrawal</p>

            <div class="grid gap-3 w-full">
              <div class="grid gap-1">
                <label class="text-mute font-semibold text-sm">Amount (USD)</label>
                <InputGroup class="w-full *:dark:bg-slate-800">
                  <InputGroupAddon>$</InputGroupAddon>
                  <InputText
                    :value="store.withdrawalRequest.amount.toLocaleString()"
                    readonly
                    class="w-full *:dark:bg-slate-800"
                  />
                </InputGroup>
              </div>

              <div class="grid gap-1">
                <label class="text-mute font-semibold text-sm">Charge (USD)</label>
                <InputGroup class="w-full *:dark:bg-slate-800">
                  <InputGroupAddon>$</InputGroupAddon>
                  <InputText
                    :value="data.currency.withdrawalCharge.toLocaleString()"
                    readonly
                    class="w-full *:dark:bg-slate-800"
                  />
                </InputGroup>
              </div>

              <div class="grid gap-1">
                <label class="text-mute font-semibold text-sm">Actual Amount (USD)</label>
                <InputGroup class="w-full *:dark:bg-slate-800">
                  <InputGroupAddon>$</InputGroupAddon>
                  <InputText
                    :value="actualAmountInUSD.toLocaleString()"
                    readonly
                    class="w-full *:dark:bg-slate-800"
                  />
                </InputGroup>
              </div>

              <div class="grid gap-1">
                <label class="text-mute font-semibold text-sm">Currency</label>
                <InputGroup class="w-full *:dark:bg-slate-800">
                  <InputGroupAddon>
                    <div class="w-5 rounded-full overlow-hidden">
                      <img :src="data.currency.image || ''" class="w-full h-full object-cover" />
                    </div>
                  </InputGroupAddon>
                  <InputText
                    :value="data.currency.name"
                    readonly
                    class="w-full *:dark:bg-slate-800"
                  />
                </InputGroup>
              </div>

              <div class="grid gap-1">
                <label class="text-mute font-semibold text-sm">
                  Rate (1 {{ data.currency.abbr }} to USD)
                </label>
                <InputGroup class="w-full *:dark:bg-slate-800">
                  <InputGroupAddon>
                    <span class="pi pi-arrow-right-arrow-left" />
                  </InputGroupAddon>
                  <InputText
                    :value="data.currency.rate"
                    readonly
                    class="w-full *:dark:bg-slate-800"
                  />
                </InputGroup>
              </div>

              <div class="grid gap-1">
                <label class="text-mute font-semibold text-sm">
                  Amount ({{ data.currency.abbr }})
                </label>
                <InputGroup class="w-full *:dark:bg-slate-800">
                  <InputGroupAddon>{{ data.currency.symbol }}</InputGroupAddon>
                  <InputText
                    :value="amountInSelectedCurrency"
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
                    :value="store.withdrawalRequest.walletAddress"
                    readonly
                    class="w-full *:dark:bg-slate-800"
                  />
                </InputGroup>
              </div>

              <div class="grid gap-1">
                <label class="text-mute font-semibold text-sm">Network</label>
                <InputGroup class="w-full *:dark:bg-slate-800">
                  <InputGroupAddon>
                    <span class="pi pi-share-alt" />
                  </InputGroupAddon>
                  <InputText
                    :value="store.withdrawalRequest.walletAddressNetwork"
                    class="w-full *:dark:bg-slate-800"
                  />
                </InputGroup>
              </div>

              <div class="grid gap-1">
                <label class="text-mute font-semibold text-sm">
                  Provide an optional note or description about your request
                </label>
                <Textarea v-model="description" rows="3" class="resize-none" />
              </div>
            </div>

            <Message class="mt-2">
              <p class="font-normal text-center">
                <span class="font-semibold text-lg">
                  {{ data.currency.abbr }} {{ amountInSelectedCurrency }}
                </span>
                will be sent to your provided wallet address within 24 hours.
              </p>
            </Message>

            <div class="mt-3 text-sm">
              <p>
                Need help?
                <RouterLink
                  :to="{ name: 'user-contact' }"
                  class="text-primary-500 hover:underline font-semibold"
                >
                  Contact us
                </RouterLink>
              </p>
            </div>

            <div class="mt-3 w-full grid gap-2">
              <VErrorMessage :error="errorFetching" />

              <Button
                @click="completeWithdrawalRequest"
                :loading="isFetching"
                label="Complete withdrawal request"
                fluid
              />
            </div>
          </div>
        </VCard>
      </div>
    </div>
  </VueLayout>
</template>
