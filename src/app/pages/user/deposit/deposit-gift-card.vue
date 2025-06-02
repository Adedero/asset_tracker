<script setup lang="ts">
import { GIFT_CARD_COUNTRIES, GIFT_CARD_TYPES } from "@/app/data/constants";
import { ref } from "vue";
import { v4 as uuid } from "uuid";
import { useToast } from "primevue/usetoast";
import { useFetch } from "@/app/composables/use-fetch";
import { DepositGiftCardInitApiResponse } from "@/modules/user/transactions/deposit-giftcard-init.api";
import { dollar } from "@/app/utils/helpers";
import { Transaction } from "#src/prisma-gen/index";

const toast = useToast();

const payload = ref<DepositGiftCardInitApiResponse | null>(null);
const visible_1 = ref<boolean>(false);
const visible_2 = ref<boolean>(false);

interface GiftCard {
  id: string;
  type: string;
  country: string;
  cardNumber: string;
  pin: string;
  amount: number;
  currency: "USD" | "CAD" | "GBP";
  isValid: boolean;
}

const cards = ref<GiftCard[]>([]);

function isValidCard(card: GiftCard): boolean {
  return (
    card.type !== "" &&
    card.country !== "" &&
    card.cardNumber !== "" &&
    card.pin !== "" &&
    card.amount > 0
  );
}

function getCardCurrency(card: GiftCard): "USD" | "CAD" | "GBP" {
  if (card.country.toLowerCase() === "united states") return "USD";
  if (card.country.toLowerCase() === "canada") return "CAD";
  if (card.country.toLowerCase() === "united kingdom") return "GBP";
  return "USD";
}

function totalAmount(currency: "USD" | "CAD" | "GBP") {
  return cards.value.reduce((total, card) => {
    if (card.currency === currency) {
      return total + card.amount;
    }
    return total;
  }, 0);
}

function addNewCard() {
  cards.value.push({
    id: uuid(),
    type: "",
    country: "",
    cardNumber: "",
    pin: "",
    amount: 0,
    currency: "USD",
    isValid: false
  });
}

const url = "/api/users/me/transactions/deposit/giftcard/initialize";
const { isFetching, data, error, execute } = useFetch(() => url, { immediate: false })
  .post(cards.value)
  .json<DepositGiftCardInitApiResponse>();

async function createDepositRequest() {
  if (cards.value.length === 0) {
    toast.add({
      severity: "warn",
      summary: "No Cards",
      detail: "Please add at least one gift card.",
      life: 5000
    });
    return;
  }
  if (!cards.value.every(isValidCard)) {
    toast.add({
      severity: "error",
      summary: "Invalid Cards",
      detail: "One or more cards have missing fields which are required.",
      life: 5000
    });
    return;
  }

  await execute();

  if (!data.value || error.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to create deposit request. Please try again later.", //error.value.message,
      life: 5000
    });
    return;
  }
  payload.value = data.value;
  visible_1.value = true;
}

//Create deposit request
const transaction = ref<Partial<Transaction>>({});
//Proceed with wire transfer deposit
const {
  isFetching: isLoading,
  error: transactionError,
  data: result,
  execute: createTransaction
} = useFetch("/api/users/me/transactions/deposit", { immediate: false }).post(transaction).json();

async function confirmDepositRequest() {
  if (!payload.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No deposit request data available. Please, try again later.",
      life: 5000
    });
    return;
  }

  transaction.value = {
    transactionType: "DEPOSIT",
    transactionStatus: "PENDING",
    amountInUSD: payload.value.total,
    charge: 0,
    actualAmountInUSD: payload.value.total,
    rate: 1,
    currency: "USD",
    amountInCurrency: payload.value.total,
    isWireTransfer: false,
    isGiftCard: true,
    giftCardData: {
      cards: cards.value.map((card) => {
        return {
          type: card.type,
          country: card.country,
          cardNumber: card.cardNumber,
          pin: card.pin,
          amount: card.amount,
          currency: card.currency
        };
      }),
      totalInUSD: payload.value.total,
      rates: payload.value.rates
    }
  };

  await createTransaction();

  if (transactionError.value || !result.value.success) {
    return;
  }
  visible_1.value = false;
  visible_2.value = true;
  cards.value = [];
  payload.value = null;
}
</script>

<template>
  <VueLayout name="user">
    <VNavbar>
      <template #left>
        <h1
          class="cursor-context-menu text-lg font-semibold text-primary-500 dark:text-primary-400"
        >
          Gift Card Deposit
        </h1>
      </template>

      <template #right>
        <div class="flex items-end gap-2">
          <Button
            :loading="isFetching"
            @click="createDepositRequest"
            label="Proceed"
            size="small"
            icon-pos="right"
            icon="pi pi-credit-card"
          />
        </div>
      </template>
    </VNavbar>

    <div class="pb-2 mt-2 overflow-y-auto md:h-[calc(100dvh-9rem)]">
      <div class="h-full grid gap-2 md:grid-cols-6 lg:grid-cols-7">
        <div class="md:col-span-2 lg:col-span-3">
          <VCard header="Total Amounts">
            <div class="grid gap-2">
              <InputGroup>
                <InputGroupAddon>USD</InputGroupAddon>
                <InputNumber :default-value="totalAmount('USD')" readonly placeholder="0" />
                <InputGroupAddon>.00</InputGroupAddon>
              </InputGroup>

              <InputGroup>
                <InputGroupAddon>CAD</InputGroupAddon>
                <InputNumber :default-value="totalAmount('CAD')" readonly placeholder="0" />
                <InputGroupAddon>.00</InputGroupAddon>
              </InputGroup>

              <InputGroup>
                <InputGroupAddon>GBP</InputGroupAddon>
                <InputNumber :default-value="totalAmount('GBP')" readonly placeholder="0" />
                <InputGroupAddon>.00</InputGroupAddon>
              </InputGroup>
            </div>
          </VCard>
        </div>

        <div class="h-full overflow-y-auto grid gap-4 md:col-span-4 lg:col-span-4 items-start">
          <VCard v-for="(card, index) in cards" :key="card.id">
            <template #header>
              <div class="flex items-center justify-between">
                <span class="font-semibold text-slate-500">
                  {{ index + 1 }}. {{ card.type }} Gift Card
                </span>
                <Button
                  @click="cards.splice(index, 1)"
                  severity="danger"
                  text
                  rounded
                  icon="pi pi-trash"
                  size="small"
                />
              </div>
            </template>

            <div class="grid gap-2 md:grid-cols-6">
              <div class="grid gap-1 md:col-span-3">
                <label class="text-mute font-semibold text-sm">
                  Type <span class="text-red-500 font-medium">*</span>
                </label>
                <Select v-model="card.type" :options="GIFT_CARD_TYPES" fluid />
              </div>

              <div class="grid gap-1 md:col-span-3">
                <label class="text-mute font-semibold text-sm">
                  Country <span class="text-red-500 font-medium">*</span>
                </label>
                <Select
                  v-model="card.country"
                  :options="GIFT_CARD_COUNTRIES"
                  fluid
                  @change="() => (card.currency = getCardCurrency(card))"
                />
              </div>

              <div class="grid gap-1 md:col-span-6">
                <label class="text-mute font-semibold text-sm">
                  Gift Card Number <span class="text-red-500 font-medium">*</span>
                </label>
                <InputText v-model="card.cardNumber" fluid />
              </div>

              <div class="grid gap-1 md:col-span-3">
                <label class="text-mute font-semibold text-sm">
                  Card PIN/Security Code <span class="text-red-500 font-medium">*</span>
                </label>
                <InputText v-model="card.pin" fluid />
              </div>

              <div class="grid gap-1 md:col-span-3">
                <label class="text-mute font-semibold text-sm">
                  Amount/Balance on Card <span class="text-red-500 font-medium">*</span>
                </label>
                <InputNumber v-model="card.amount" :max-fraction-digits="2" fluid />
              </div>
            </div>
          </VCard>

          <button
            @click="addNewCard"
            class="cursor-pointer border-2 border-slate-300 hover:bg-slate-200 transition-colors border-dashed rounded-lg p-2 w-full h-32"
          >
            <div class="flex flex-col gap-2 text-slate-400">
              <span class="pi pi-plus-circle" style="font-size: 1.8rem" />
              <span class="font-semibold">Add Gift Card</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="visible_1" modal header="Gift Card Deposit" class="max-w-96">
      <VErrorMessage :error="transactionError" class="my-2" />

      <div v-if="payload" class="flex-col-center gap-1">
        <p class="text-slate-500 font-medium">Total Deposit Amount</p>
        <p class="text-3xl font-semibold text-emerald-500 bg-emerald-50 rounded-md p-2">
          {{ dollar.format(payload.total) }}
        </p>

        <div class="mt-1 text-sm" v-if="payload.rates.CAD || payload.rates.GBP">
          The total amount was calculated based on the following rates:
          <Divider />
          <div v-if="payload.rates.CAD">
            <span class="font-medium">1 USD</span> =
            <span class="font-semibold text-[var(--color-primary-500)]"
              >CAD {{ payload.rates.CAD }}</span
            >
          </div>

          <div v-if="payload.rates.GBP">
            <span class="font-medium">1 USD</span> =
            <span class="font-semibold text-[var(--color-primary-500)]"
              >GBP {{ payload.rates.GBP }}</span
            >
          </div>
          <Divider />

          <Message size="small">
            NOTE: The rates are subject to change based on market conditions and may vary at the
            time of deposit.
          </Message>
        </div>

        <Button
          @click="confirmDepositRequest"
          :loading="isLoading"
          label="Proceed with deposit request"
          icon="pi pi-check-circle"
          icon-pos="right"
          class="mt-3"
        />
      </div>
    </Dialog>

    <Dialog
      v-model:visible="visible_2"
      modal
      header="Deposit Request"
      class="max-w-[90dvw] md:w-96 dark:bg-slate-900"
      :closable="false"
    >
      <div class="flex flex-col items-center justify-center text-center">
        <span class="pi pi-check-circle text-emerald-500" style="font-size: 40px" />
        <p class="mt-4">Your deposit request has been received.</p>
        <p>Once confirmed, your account will be credited<!--  within 15 minutes -->.</p>
      </div>

      <div class="mt-4">
        <Button @click="$router.push({ name: 'user-transactions' })" label="Continue" fluid />
      </div>
    </Dialog>
  </VueLayout>
</template>
