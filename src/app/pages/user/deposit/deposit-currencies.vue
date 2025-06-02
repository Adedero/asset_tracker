<script setup lang="ts">
import { onMounted, ref } from "vue";
import { $fetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import { CurrenciesGetApiResponse } from "@/modules/user/currencies/currencies-get.api";
import { Currency } from "@/prisma-gen";
import useStore from "@/app/stores/store";
import { useRouter } from "vue-router";
import giftCard from "@/app/assets/img/giftcard.png";
import new_icon from "@/app/assets/img/new.png";

const router = useRouter();
const store = useStore();
const visible = ref(false);
const isWireTransfer = ref(false);
const selectedCurrency = ref<Currency>();
const amount = ref(0);

const { isLoading, data, error, mutate } = useSWRV<CurrenciesGetApiResponse>(
  () => "/api/users/me/currencies",
  $fetch
);

const onCurrencyClick = (currency: Currency | null) => {
  visible.value = true;
  amount.value = 0;
  isWireTransfer.value = currency === null;
  if (currency) {
    selectedCurrency.value = currency;
  }
};

const initiateDeposit = () => {
  store.depositRequest = {
    amount: amount.value,
    isWireTransfer: isWireTransfer.value,
    currencyName: isWireTransfer.value ? "WIRE_TRANSFER" : selectedCurrency.value?.name || "Dollar",
    currencyAbbr: isWireTransfer.value ? "USD" : selectedCurrency.value?.abbr || "USD",
    currencySymbol: isWireTransfer.value ? "$" : selectedCurrency.value?.symbol || "$"
  };
  router.push({
    name: "user-deposit-initialize"
  });
};

onMounted(() => {
  store.depositRequest = null;
});
</script>

<template>
  <VueLayout name="user">
    <div class="h-full">
      <VNavbar>
        <template #left>
          <h1
            class="cursor-context-menu text-lg font-semibold text-primary-500 dark:text-primary-400"
          >
            Deposit Options
          </h1>
        </template>
      </VNavbar>

      <Dialog
        v-model:visible="visible"
        modal
        :header="isWireTransfer ? 'Wire Transfer' : `${selectedCurrency?.name} Deposit`"
        class="md:w-96 dark:bg-slate-900"
      >
        <div class="grid gap-4">
          <div class="grid gap-1">
            <label class="text-mute font-semibold text-sm">
              Amount
              <span class="font-normal">($10 - $100,000)</span>
            </label>
            <InputGroup class="w-full *:dark:bg-slate-800">
              <InputGroupAddon>$</InputGroupAddon>
              <InputNumber
                v-model="amount"
                :min="10"
                :max="100000"
                :minFractionDigits="0"
                :maxFractionDigits="2"
                class="w-full *:dark:bg-slate-800"
              />
              <InputGroupAddon>.00</InputGroupAddon>
            </InputGroup>
            <small>Minimum deposit amount: <span class="font-semibold">$10</span></small>
          </div>

          <div class="flex items-center justify-end gap-2">
            <Button
              @click="
                visible = false;
                selectedCurrency = undefined;
              "
              severity="secondary"
              label="Cancel"
              class="dark:bg-slate-700 dark:border-slate-700 dark:hover:bg-slate-600"
            />
            <Button @click="initiateDeposit" :disabled="!amount" label="Proceed" />
          </div>
        </div>
      </Dialog>

      <div class="mt-2 overflow-y-auto md:h-[calc(100dvh-8rem)]">
        <VPageLoader v-if="isLoading" />

        <div v-else-if="error" class="flex-center">
          <VErrorMessage :error should-retry @retry="mutate()" />
        </div>

        <div
          v-else-if="data"
          class="w-full grid gap-2 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]"
        >
          <VCard
            header="Gift Card"
            header-class="z-10 text-white"
            class="relative overflow-hidden z-[1]"
          >
            <div class="flex flex-col items-center gap-2 z-10">
              <img :src="new_icon" width="90px" class="z-10" />
            </div>
            <Divider class="bg-white border-white z-10" />
            <Button
              @click="router.push({ name: 'user-deposit-gift-card' })"
              size="small"
              label="Deposit"
              fluid
              class="z-10"
            />
            <img
              class="brightness-120 w-full h-full object-cover absolute left-0 top-0 z-0"
              :src="giftCard"
              alt="gift card"
            />
          </VCard>

          <VCard header="Wire Transfer">
            <div class="flex flex-col items-center gap-2">
              <SvgIcon size="40" name="money-transfer" />
              <p class="font-medium">Wire / Bank Transfer</p>
            </div>
            <Divider />
            <Button @click="onCurrencyClick(null)" size="small" label="Deposit" fluid />
          </VCard>

          <VCard v-for="c in data.currencies" :key="c.name" :header="c.name">
            <div class="flex flex-col items-center gap-2">
              <img :src="c.image || ''" width="40" class="rounded-full" />
              <p class="font-medium">{{ c.abbr }}</p>
            </div>
            <Divider />
            <Button @click="onCurrencyClick(c)" size="small" label="Deposit" fluid />
          </VCard>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
