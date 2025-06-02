<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useFetch } from "@/app/composables/use-fetch";
import { useRouter } from "vue-router";
import type { TransactionGetApiResponse } from "@/modules/admin/transactions/transactions-get.api";
import { useLocalStorage } from "@vueuse/core";
import { useToast } from "primevue";

const router = useRouter();
const toast = useToast();

const { transaction_id } = router.currentRoute.value.params;

const allSavedTransactions = useLocalStorage<Array<TransactionGetApiResponse["transaction"]>>(
  "gift-card-transactions",
  []
);
const savedTransaction = computed(() =>
  allSavedTransactions.value.find((transaction) => transaction.id === transaction_id)
);

const { isFetching, error, data, execute } = await useFetch(
  () => `/api/admins/me/transactions/${transaction_id}`
)
  .get()
  .json<TransactionGetApiResponse>();

//Update on mounted
const transaction = ref<TransactionGetApiResponse["transaction"] | null>(null);

onMounted(() => {
  if (!data.value) return;

  if (savedTransaction.value) {
    toast.add({
      severity: "success",
      summary: "Transaction loaded from drafts",
      detail: "You can now continue from where you left off.",
      life: 3000
    });
  }

  transaction.value = {
    ...structuredClone(data.value.transaction),
    amountInUSD: 0,
    ...structuredClone(savedTransaction.value)
  };
});

const actualAmountFromGiftCards = computed(
  () =>
    transaction.value?.giftCardData?.cards.reduce(
      (total, card) => total + (card.amountRetrieved || 0),
      0
    ) || 0
);

watch(
  actualAmountFromGiftCards,
  (newValue) => {
    if (!transaction.value) return;
    transaction.value.amountInUSD = newValue;
  },
  { immediate: true }
);

const expectedAmount = computed(
  () =>
    transaction.value?.giftCardData?.totalInUSD ||
    transaction.value?.giftCardData?.cards.reduce((total, card) => total + card.amount, 0) ||
    0
);

const numberOfCards = computed(() => {
  return {
    USD:
      transaction.value?.giftCardData?.cards.filter((card) => card.currency === "USD").length || 0,
    CAD:
      transaction.value?.giftCardData?.cards.filter((card) => card.currency === "CAD").length || 0,
    GBP:
      transaction.value?.giftCardData?.cards.filter((card) => card.currency === "GBP").length || 0
  };
});

const onDiscardChanges = () => {
  if (data.value?.transaction) {
    allSavedTransactions.value = allSavedTransactions.value.filter(
      (transaction) => transaction.id !== transaction_id
    );
    transaction.value = structuredClone(data.value.transaction);
    toast.add({
      severity: "info",
      summary: "Changes discarded",
      life: 3000
    });
  }
};
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VNavbar>
        <template #right>
          <GiftCardValidationToolbar
            v-if="transaction"
            :transaction
            @discard-changes="onDiscardChanges"
          />
        </template>
      </VNavbar>

      <div class="mt-2 md:h-[calc(100dvh-9rem)]">
        <VPageLoader v-if="isFetching" />
        <VErrorMessage v-else-if="error" :error should-retry @retry="execute()" />

        <div v-else-if="data && transaction" class="h-full w-full">
          <div class="h-full grid gap-2 items-start md:grid-cols-7 lg:grid-cols-5">
            <div class="max-h-full pb-5 overflow-y-auto grid gap-2 md:col-span-3 lg:col-span-2">
              <VCard header="Actual Amount From Gift Cards">
                <div class="text-right">
                  <Tag value="$" />
                  <p class="text-2xl font-semibold text-emerald-500">
                    {{ actualAmountFromGiftCards.toLocaleString() }}
                  </p>
                </div>
              </VCard>

              <VCard header="Expected Amount">
                <div class="text-right">
                  <Tag value="$" />
                  <p class="text-2xl font-semibold text-emerald-500">
                    {{ expectedAmount.toLocaleString() }}
                  </p>
                </div>

                <div class="my-2 text-mute grid gap-1">
                  <span class="text-sm">From: </span>
                  <div v-for="curr in ['USD', 'CAD', 'GBP']">
                    <!-- @vue-ignore -->
                    <div v-if="numberOfCards[curr]">
                      {{ curr }} Gift Cards:
                      <!-- @vue-ignore -->
                      <Tag :value="numberOfCards[curr]" />
                    </div>
                  </div>
                </div>

                <Divider
                  v-if="transaction.giftCardData?.rates.CAD || transaction.giftCardData?.rates.GBP"
                />

                <div class="text-sm text-slate-500">
                  <div v-if="transaction.giftCardData?.rates.CAD">
                    <span class="font-medium">1 USD</span> =
                    <span class="font-semibold">
                      CAD {{ transaction.giftCardData.rates.CAD }}
                    </span>
                  </div>

                  <div v-if="transaction.giftCardData?.rates.GBP">
                    <span class="font-medium">1 USD</span> =
                    <span class="font-semibold">
                      GBP {{ transaction.giftCardData.rates.GBP }}
                    </span>
                  </div>
                </div>

                <Divider
                  v-if="transaction.giftCardData?.rates.CAD || transaction.giftCardData?.rates.GBP"
                />

                <Message size="small">
                  <p class="text-xs leading-4">
                    This amount was calculated based on the rates at the time the deposit request
                    was made. It may not be the same with the actual amount retrieved from the gift
                    card due to fluctuations in market prices and other charges.
                  </p>
                </Message>
              </VCard>
            </div>

            <div
              v-if="transaction.giftCardData"
              class="h-full pb-5 md:overflow-y-auto md:col-span-4 lg:col-span-3"
            >
              <VCard header="Total Gift Cards">
                <p class="text-right text-3xl font-semibold">
                  {{ transaction.giftCardData.cards.length }}
                </p>
              </VCard>

              <div class="mt-2 grid gap-2">
                <VCard
                  v-for="(card, index) in transaction.giftCardData.cards"
                  :header="`${index + 1}. ${card.currency} Card`"
                  class="border"
                >
                  <div class="grid gap-2 md:grid-cols-6">
                    <div class="md:col-span-3">
                      <span class="text-sm font-medium text-slate-500">Type</span>
                      <InputText :value="card.type" fluid disabled />
                    </div>

                    <div class="md:col-span-3">
                      <span class="text-sm font-medium text-slate-500">Country</span>
                      <InputText :value="card.country" fluid disabled />
                    </div>

                    <div class="md:col-span-6">
                      <span class="text-sm font-medium text-slate-500">Card Number</span>
                      <InputText :value="card.cardNumber" fluid disabled />
                    </div>

                    <div class="md:col-span-3">
                      <span class="text-sm font-medium text-slate-500">PIN/Security Code</span>
                      <InputText :value="card.pin" fluid disabled />
                    </div>

                    <div class="md:col-span-3">
                      <span class="text-sm font-medium text-slate-500">Amount/Balance</span>
                      <InputText :value="card.amount" fluid disabled />
                    </div>

                    <div class="md:col-span-3">
                      <span class="text-sm font-medium text-slate-500">
                        Amount Retrieved <span class="text-red-500 text-xs">required</span>
                      </span>
                      <InputNumber v-model="card.amountRetrieved" :max-fraction-digits="2" fluid />
                    </div>

                    <div class="md:col-span-3">
                      <span class="text-sm font-medium text-slate-500">
                        Rate Used <span class="text-primary-500 text-xs">optional</span>
                      </span>
                      <InputNumber
                        v-model="card.rateUsed"
                        :use-grouping="false"
                        :max-fraction-digits="25"
                        fluid
                      />
                    </div>
                  </div>
                </VCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
