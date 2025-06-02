<script setup lang="ts">
import { computed } from "vue";
import { $fetch } from "@/app/composables/use-fetch";
import { dollar } from "@/app/utils/helpers";
import useSWRV from "swrv";
import { useRoute } from "vue-router";
import { useDateFormat } from "@vueuse/core";
import { TransactionGetApiResponse } from "@/modules/user/transactions/transactions-get.api";

const route = useRoute();

const transaction_id = route.params.transaction_id.toString();

const { isLoading, data, error, mutate } = useSWRV<TransactionGetApiResponse>(
  () => `/api/users/me/transactions/${transaction_id}`,
  $fetch
);

function numberOfCards(currency: "USD" | "CAD" | "GBP") {
  return data.value?.transaction.giftCardData?.cards.filter((card) => card.currency === currency)
    .length;
}

const isExpected = computed(() => {
  return (
    (data.value?.transaction.amountInUSD || 0) >=
    (data.value?.transaction.giftCardData?.totalInUSD || 0)
  );
});

type Card = PrismaJson.GiftCardData["cards"][number];

function totalAmount(currency: "USD" | "CAD" | "GBP") {
  return data.value?.transaction.giftCardData?.cards.reduce((total, card) => {
    if (card.currency === currency) {
      return total + card.amount;
    }
    return total;
  }, 0);
}

function totalAmountInUSD() {
  if (!data.value?.transaction.giftCardData) return 0;
  const { transaction: txn } = data.value;

  return txn.giftCardData?.cards.reduce((total, card) => {
    if (card.currency === "USD") {
      return total + card.amount;
    } else if (card.currency === "CAD") {
      return total + card.amount / (txn.giftCardData?.rates.CAD || 1);
    } else if (card.currency === "GBP") {
      return total + card.amount / (txn.giftCardData?.rates.GBP || 1);
    }
    return total;
  }, 0);
}
</script>

<template>
  <VueLayout name="user">
    <div class="h-full">
      <VNavbar>
        <template v-if="data" #right>
          <div class="flex flex-wrap md:flex-nowrap justify-end items-center gap-2">
            <div class="text-right">
              <small class="text-slate-500">Deposited</small>
              <p
                :class="`font-semibold text-lg md:text-2xl leading-5 ${isExpected ? 'text-emerald-500' : 'text-red-500'}`"
              >
                {{ dollar.format(data.transaction.amountInUSD) }}
              </p>
            </div>

            <Divider layout="vertical" />

            <div class="text-right">
              <small class="text-slate-500">Requested</small>
              <p class="text-emerald-500 font-semibold text-lg md:text-2xl leading-5">
                {{
                  dollar.format(
                    data.transaction.giftCardData?.totalInUSD || totalAmountInUSD() || 0
                  )
                }}
              </p>
            </div>
          </div>
        </template>
      </VNavbar>

      <div class="mt-2 overflow-y-auto md:h-[calc(100dvh-9rem)]">
        <VPageLoader v-if="isLoading" />

        <div v-else-if="error" class="w-full max-w-[28rem]">
          <VErrorMessage :error should-retry @retry="mutate()" />
        </div>

        <div v-else-if="data">
          <div v-if="data.transaction.transactionStatus === 'SUCCESSFUL'">
            <div class="grid gap-2 items-start md:grid-cols-7 lg:grid-cols-5">
              <div class="grid gap-2 md:col-span-3 lg:col-span-2">
                <VCard v-if="totalAmount('USD')">
                  <template #header>
                    <div class="flex items-center gap-1">
                      <p class="text-slate-500 font-semibold">US Gift Cards</p>
                      <Badge severity="danger" :value="numberOfCards('USD')" />
                    </div>
                  </template>
                  <div class="text-right">
                    <Tag value="USD" />
                    <p class="text-2xl font-semibold">
                      {{ totalAmount("USD")?.toLocaleString() || 0 }}
                    </p>
                  </div>
                </VCard>

                <VCard v-if="totalAmount('CAD')" header="Canadian Gift Cards">
                  <template #header>
                    <div class="flex items-center gap-1">
                      <p class="text-slate-500 font-semibold">Canadian Gift Cards</p>
                      <Badge severity="danger" :value="numberOfCards('CAD')" />
                    </div>
                  </template>

                  <div class="text-right">
                    <Tag value="CAD" />
                    <p class="text-2xl font-semibold">
                      {{ totalAmount("CAD")?.toLocaleString() || 0 }}
                    </p>
                  </div>
                </VCard>

                <VCard v-if="totalAmount('GBP')" header="UK Gift Cards">
                  <template #header>
                    <div class="flex items-center gap-1">
                      <p class="text-slate-500 font-semibold">UK Gift Cards</p>
                      <Badge severity="danger" :value="numberOfCards('GBP')" />
                    </div>
                  </template>
                  <div class="text-right">
                    <Tag value="GBP" />
                    <p class="text-2xl font-semibold">
                      {{ totalAmount("GBP")?.toLocaleString() || 0 }}
                    </p>
                  </div>
                </VCard>

                <VCard header="Requested Total (USD)">
                  <div class="text-right">
                    <p class="text-2xl font-semibold">
                      {{
                        dollar.format(
                          data.transaction.giftCardData?.totalInUSD || totalAmountInUSD() || 0
                        )
                      }}
                    </p>
                  </div>

                  <Divider
                    v-if="
                      data.transaction.giftCardData?.rates.CAD ||
                      data.transaction.giftCardData?.rates.GBP
                    "
                  />

                  <div class="text-sm text-slate-500">
                    <div v-if="data.transaction.giftCardData?.rates.CAD">
                      <span class="font-medium">1 USD</span> =
                      <span class="font-semibold">
                        CAD {{ data.transaction.giftCardData.rates.CAD }}
                      </span>
                    </div>

                    <div v-if="data.transaction.giftCardData?.rates.GBP">
                      <span class="font-medium">1 USD</span> =
                      <span class="font-semibold">
                        GBP {{ data.transaction.giftCardData.rates.GBP }}
                      </span>
                    </div>
                  </div>

                  <Divider
                    v-if="
                      data.transaction.giftCardData?.rates.CAD ||
                      data.transaction.giftCardData?.rates.GBP
                    "
                  />

                  <Message v-if="totalAmount('CAD') || totalAmount('GBP')" size="small">
                    <p class="text-xs font-normal">
                      The rates above were based on the market rates at the time of the creation of
                      the deposit request :
                      <b>{{
                        useDateFormat(data.transaction.createdAt, "MMM DD, YYYY hh:mm:ss aa")
                      }}</b
                      >. <br />
                      Please note that at the time of validating the gift cards, the rates may have
                      changed.
                    </p>
                  </Message>
                </VCard>
              </div>

              <div class="md:col-span-4 lg:col-span-3">
                <VCard header="Your Gift Cards">
                  <p class="text-right text-3xl font-semibold">
                    {{ data.transaction.giftCardData?.cards.length }}
                  </p>
                </VCard>

                <div class="mt-2 grid gap-2">
                  <VCard
                    v-for="(card, index) in data.transaction.giftCardData?.cards || []"
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
                        <span class="text-sm font-medium text-slate-500">Amount Retrieved</span>
                        <InputText :value="card.amountRetrieved" fluid disabled />
                      </div>

                      <div class="md:col-span-3">
                        <span class="text-sm font-medium text-slate-500">Rate Used</span>
                        <InputText :value="card.rateUsed" fluid disabled />
                      </div>
                    </div>
                  </VCard>
                </div>
              </div>
            </div>
          </div>

          <div v-else>
            <Message>
              No report exists for this gift card transaction because it has not yet been approved.
            </Message>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
