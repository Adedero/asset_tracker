<script setup lang="ts">
import type { Transaction } from "@/prisma-gen";
import { toTitleCase } from "@/app/utils/helpers";
import { useToast } from "primevue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useFetch } from "@/app/composables/use-fetch";
import { TransactionApprovalApiResponse } from "@/modules/admin/transactions/transaction-approve.api";
import { TransactionFailApiResponse } from "@/modules/admin/transactions/transaction-fail.api";

const { transaction, action } = defineProps<{
  transaction: Transaction;
  action: "approve" | "fail";
}>();

const emit = defineEmits<{
  update: [transaction: Transaction];
}>();

const router = useRouter();
const toast = useToast();
const confirm = ref<boolean>(false);
const visible = ref<boolean>(false);

const request = ref({
  failReason: ""
});

const {
  isFetching: isApproving,
  error: approvalError,
  data: approvalData,
  execute: approve
} = useFetch(() => `/api/admins/me/transactions/${transaction.id}/approve`, { immediate: false })
  .put()
  .json<TransactionApprovalApiResponse>();

const {
  isFetching: isFailing,
  error: failError,
  data: failData,
  execute: fail
} = useFetch(() => `/api/admins/me/transactions/${transaction.id}/fail`, { immediate: false })
  .put(request)
  .json<TransactionFailApiResponse>();

async function updateTransaction() {
  const { valid, message } = validateRequest();

  if (!valid) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: message,
      life: 6000
    });
    return;
  }

  if (action === "approve") {
    await approve();
  }

  if (action === "fail") {
    await fail();
  }

  if (approvalError.value || failError.value) {
    return;
  }

  if (approvalData.value) {
    emit("update", approvalData.value.transaction);
    toast.add({
      severity: "success",
      summary: "Done",
      detail: approvalData.value.message || "Transaction status updated successfully",
      life: 3000
    });
  }

  if (failData.value) {
    emit("update", failData.value.transaction);
    toast.add({
      severity: "success",
      summary: "Done",
      detail: failData.value.message || "Transaction status updated successfully",
      life: 3000
    });
  }
  cancel();
}

function validateRequest() {
  if (transaction.transactionStatus !== "PENDING") {
    return {
      valid: false,
      message: "Transaction status has already been resolved"
    };
  }

  if (transaction.transactionType !== "DEPOSIT" && transaction.transactionType !== "WITHDRAWAL") {
    return {
      valid: false,
      message: "Only deposit or withdrawal transactions can be modified"
    };
  }

  if (action === "approve" && !confirm.value) {
    return {
      valid: false,
      message: "Please, confirm the action"
    };
  }

  if (action === "fail" && !request.value.failReason) {
    return {
      valid: false,
      message: "No reason for failure provided"
    };
  }

  return { valid: true, messsage: "Validation successful" };
}

async function handleClick() {
  if (
    transaction.transactionStatus === "PENDING" &&
    action === "approve" &&
    transaction.isGiftCard
  ) {
    await router.push({
      name: "admin-gift-card-validate",
      params: {
        transaction_id: transaction.id
      }
    });
  } else {
    visible.value = true;
  }
}

function cancel() {
  confirm.value = false;
  visible.value = false;
  request.value.failReason = "";
}
</script>

<template>
  <div>
    <div @click="handleClick" class="cursor-pointer">
      <slot :action>
        <Button
          v-if="action === 'approve'"
          :label="`Approve ${toTitleCase(transaction.transactionType)}`"
          icon="pi pi-chevron-right"
          icon-pos="right"
          size="small"
          fluid
        />

        <Button
          v-if="action === 'fail'"
          :label="`Fail ${toTitleCase(transaction.transactionType)}`"
          icon="pi pi-chevron-right"
          icon-pos="right"
          size="small"
          fluid
          severity="danger"
        />
      </slot>
    </div>

    <Dialog
      v-model:visible="visible"
      modal
      header="Update Transaction Status"
      class="w-full max-w-96"
    >
      <div>
        <VErrorMessage :error="approvalError" class="mt-2" />
        <VErrorMessage :error="failError" class="mt-2" />

        <p>
          You are about to
          <span :class="`font-semibold ${action === 'fail' ? 'text-red-500' : 'text-green-500'}`">
            {{ action }}
          </span>
          this {{ transaction.transactionType }} transaction and this cannot be undone. Are you sure
          you want to proceed?
        </p>

        <div v-if="action === 'approve'" class="mt-2 border rounded-lg p-2 flex items-start gap-2">
          <Checkbox binary v-model="confirm" />
          <p class="text-sm text-mute">
            <span v-if="transaction.isWireTransfer">
              I have received
              <span class="font-semibold"> ${{ transaction.amountInUSD.toLocaleString() }} </span>
              from the client via wire transfer.
            </span>

            <span v-else-if="transaction.transactionType === 'DEPOSIT'">
              I have received
              <span class="font-semibold">
                {{ transaction.amountInCurrency }} {{ transaction.currency }} </span
              >,
              <span>the equivalent of </span>
              <span class="font-semibold"> ${{ transaction.amountInUSD.toLocaleString() }} </span>
              <span> from the client via cryptocurrency deposit to my wallet address. </span>
            </span>

            <span v-else>
              I have sent
              <span class="font-semibold">
                {{ `${transaction.amountInCurrency} ${transaction.currency}` }} </span
              >, the equivalent of
              <span class="font-semibold">
                ${{ transaction.actualAmountInUSD.toLocaleString() }}
              </span>
              <span> to the client's wallet address: </span>
              <span class="font-semibold">
                {{ transaction.withdrawalWalletAddress }}
              </span>
            </span>
          </p>
        </div>

        <div v-if="action === 'fail'" class="mt-2">
          <p class="text-sm text-mute font-medium">
            Reason for transaction failure <span class="text-red-500">*</span>
          </p>
          <Textarea v-model="request.failReason" rows="4" class="resize-none" fluid />
        </div>

        <div class="mt-4 flex items-center justify-end gap-2">
          <Button @click="cancel" label="Cancel" severity="secondary" />

          <Button
            v-if="action === 'approve'"
            @click="updateTransaction"
            :loading="isApproving"
            :disabled="isApproving || !confirm"
            label="Proceed"
            severity="primary"
          />

          <Button
            v-if="action === 'fail'"
            @click="updateTransaction"
            :loading="isFailing"
            :disabled="isFailing || !request.failReason"
            label="Proceed"
            severity="danger"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
