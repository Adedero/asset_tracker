<script setup lang="ts">
import { useFetch } from "@/app/composables/use-fetch";
import { TransactionGetApiResponse } from "@/modules/user/transactions/transactions-get.api";
import { useLocalStorage } from "@vueuse/core";
import { useConfirm, useToast } from "primevue";
import { computed } from "vue";
import { useRouter } from "vue-router";

interface Props {
  transaction: TransactionGetApiResponse["transaction"];
}
const { transaction } = defineProps<Props>();
const emit = defineEmits<{
  discardChanges: [];
}>();

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const allSavedTransactions = useLocalStorage<Array<TransactionGetApiResponse["transaction"]>>(
  "gift-card-transactions",
  []
);

const saveProgress = () => {
  allSavedTransactions.value.push(transaction);
  toast.add({
    severity: "success",
    summary: "Success",
    detail: "Progress saved",
    life: 3000
  });
};

const confirmRevert = () => {
  confirm.require({
    header: "Disacrd changes",
    message: "Do you want to discard all changes made to this transaction?",
    rejectProps: {
      label: "Cancel",
      severity: "secondary"
    },
    acceptProps: {
      label: "Proceed"
    },
    accept() {
      emit("discardChanges");
    }
  });
};

const request = computed(() => {
  return {
    amountInUSD: transaction.amountInUSD,
    cards: transaction.giftCardData?.cards
  };
});

const { isFetching, error, data, execute } = useFetch(
  () => `/api/admins/me/transactions/${transaction.id}/approve`,
  { immediate: false }
)
  .put(request)
  .json();

async function approveTransaction() {
  const { valid, message } = validateTransaction();

  if (!valid) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 3000
    });
    return;
  }

  await execute();

  if (error.value || !data.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.value?.message
    });
    return;
  }

  setTimeout(() => {
    router.push({
      name: "admin-transaction-item",
      params: {
        transaction_id: transaction.id
      }
    });
  }, 3000);

  toast.add({
    severity: "success",
    summary: "Success",
    detail: data.value.message || "Transaction marked as approved",
    life: 3000
  });
}

function validateTransaction() {
  if (transaction.transactionStatus !== "PENDING") {
    return { valid: false, message: "Transaction status has already been resolved" };
  }

  if (transaction.transactionType !== "DEPOSIT") {
    return { valid: false, message: "Only deposit transactions can be modified" };
  }

  if (!transaction.amountInUSD) {
    return { valid: false, message: "Transaction amount is not set" };
  }

  if (transaction.giftCardData?.cards.some((card) => !card.amountRetrieved)) {
    return {
      valid: false,
      message: "One or more cards have not been validated. Validate all cards and try again"
    };
  }

  return { valid: true, message: "Validation successful" };
}

const confirmApproval = () => {
  confirm.require({
    header: "Approve transaction",
    message: "Do you want to approve this transaction?",
    rejectProps: {
      label: "Cancel",
      severity: "secondary"
    },
    acceptProps: {
      label: "Approve"
    },
    accept() {
      approveTransaction();
    }
  });
};

const onTransactionStatusUpdate = () => {
  router.push({
    name: "admin-transaction-item",
    params: {
      transaction_id: transaction.id
    }
  });
};
</script>

<template>
  <div>
    <div class="flex items-center gap-1">
      <Button
        @click="saveProgress"
        v-tooltip="'Save progress'"
        icon="pi pi-save"
        size="small"
        outlined
      />
      <Button
        @click="confirmRevert()"
        v-tooltip="'Discard changes'"
        icon="pi pi-refresh"
        size="small"
        outlined
      />
      <TransactionStatusManager @update="onTransactionStatusUpdate" :transaction action="fail">
        <Button v-tooltip="'Fail transaction'" icon="pi pi-times-circle" size="small" outlined />
      </TransactionStatusManager>
      <Button
        @click="confirmApproval()"
        v-tooltip="'Approve transaction'"
        label="Approve"
        icon="pi pi-check-circle"
        size="small"
      />
    </div>
  </div>
</template>
