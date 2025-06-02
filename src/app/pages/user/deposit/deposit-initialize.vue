<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { $fetch, useFetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import useStore from "@/app/stores/store";
import { DepositInitApiResponse } from "#src/modules/user/transactions/deposit-init.api";
import { dollar } from "@/app/utils/helpers";
import { Icon } from "@iconify/vue";
import { Transaction } from "@/prisma-gen";

const router = useRouter();
const store = useStore();
if (!store.depositRequest) {
  await router.push({ name: "user-deposit-currencies" });
}

const visible = ref(false);

const api = ref<string | null>(
  `/api/users/me/transactions/deposit/initialize?amount=${store.depositRequest!.amount}&symbol=${store.depositRequest!.currencyAbbr}`
);

//Get deposit init data
const { isLoading, error, data, mutate } = useSWRV<DepositInitApiResponse>(api.value, $fetch);

const transaction = ref<Partial<Transaction>>({});
//Proceed with wire transfer deposit
const {
  isFetching,
  error: transactionError,
  data: result,
  execute
} = useFetch("/api/users/me/transactions/deposit", { immediate: false }).post(transaction).json();

const proceedWithDeposit = async () => {
  if (!data.value) return;

  if (!store.depositRequest!.isWireTransfer) {
    store.depositInitData = data.value;
    await router.push({ name: "user-deposit-preview" });
    return;
  }

  transaction.value = {
    userId: store.user.id,
    transactionType: "DEPOSIT",
    transactionStatus: "PENDING",
    amountInUSD: data.value.request.amount,
    charge: 0,
    actualAmountInUSD: data.value.request.amount,
    rate: 1,
    currency: "USD",
    amountInCurrency: data.value.request.amount,
    isWireTransfer: true
  };
  await execute();

  if (transactionError.value || !result.value.success) {
    return;
  }
  api.value = null;
  visible.value = true;
};

onUnmounted(() => {
  store.depositRequest = null;
});
</script>

<template>
  <VueLayout name="user">
    <div class="h-full">
      <VNavbar />

      <Dialog v-model:visible="visible" modal :closable="false" header="Wire Transfer" class="w-80">
        <div class="flex-col-center gap-1">
          <Icon icon="ic:baseline-check-circle" style="font-size: 50px" class="text-emerald-500" />
          <p class="text-center">
            Your deposit request has been submitted and the details of the wire transfer will be
            sent to your email address shortly
          </p>
          <RouterLink :to="{ name: 'user-transactions' }" class="mt-2 w-full">
            <Button label="Continue" fluid />
          </RouterLink>
        </div>
      </Dialog>

      <div class="mt-4 flex items-center justify-center">
        <VPageLoader v-if="isLoading" />

        <div v-else-if="error" class="flex-center">
          <VErrorMessage :error should-retry @retry="mutate()" />
        </div>

        <VCard v-else-if="data" class="w-full max-w-[28rem] md:!p-6">
          <div class="text-center">
            <p class="text-2xl font-semibold">{{ dollar.format(data.user.walletBalance) }}</p>
            <p>Account Balance</p>
          </div>

          <VErrorMessage :error="transactionError" />

          <div class="mt-2 grid gap-y-3 gap-x-2 md:grid-cols-2">
            <div class="grid gap-1 md:col-span-2">
              <label class="text-sm font-semibold text-mute">Deposit Amount in USD</label>
              <InputGroup class="w-full *:dark:bg-slate-800">
                <InputGroupAddon>$</InputGroupAddon>
                <InputText
                  :value="data.request.amount"
                  readonly
                  class="w-full *:dark:bg-slate-800"
                />
                <InputGroupAddon>.00</InputGroupAddon>
              </InputGroup>
            </div>

            <div class="grid gap-1">
              <label class="text-sm font-semibold text-mute">Rate</label>
              <InputGroup class="w-full *:dark:bg-slate-800">
                <InputGroupAddon>$</InputGroupAddon>
                <InputText
                  :value="data.request.isWireTransfer ? 1 : data.currency?.rate"
                  readonly
                  class="w-full *:dark:bg-slate-800"
                />
              </InputGroup>
            </div>

            <div class="grid gap-1">
              <label class="text-sm font-semibold text-mute">Charges</label>
              <InputGroup class="w-full *:dark:bg-slate-800">
                <InputGroupAddon>$</InputGroupAddon>
                <InputText value="0" readonly class="w-full *:dark:bg-slate-800" />
              </InputGroup>
            </div>

            <div class="grid gap-1 md:col-span-2">
              <label class="text-sm font-semibold text-mute">
                Amount in
                {{ data.request.isWireTransfer ? "USD" : data.currency?.abbr }}</label
              >
              <InputGroup class="w-full *:dark:bg-slate-800">
                <InputGroupAddon>
                  {{ data.request.isWireTransfer ? "$" : (data.currency?.symbol ?? "$") }}
                </InputGroupAddon>
                <InputText :value="data.result" readonly class="w-full *:dark:bg-slate-800" />
              </InputGroup>
            </div>
          </div>

          <div class="mt-4 flex items-center gap-2 justify-end">
            <Button
              @click="router.back()"
              label="Cancel"
              severity="secondary"
              class="dark:bg-slate-700"
            />
            <Button :loading="isFetching" @click="proceedWithDeposit" label="Proceed" />
          </div>
        </VCard>
      </div>
    </div>
  </VueLayout>
</template>
