<script setup lang="ts">
import { useFetch } from "@/app/composables/use-fetch";
import type { Account } from "@/prisma-gen";
import { useToast } from "primevue";
import { computed, ref } from "vue";

const { account } = defineProps<{
  account: Account;
}>();

const emit = defineEmits<{
  update: [balance: number];
}>();

const toast = useToast();
const visible = ref<boolean>(false);
const confirm = ref<boolean>(false);

const update = ref({ walletBalance: account.walletBalance });

const { isFetching, error, data, execute } = useFetch(`/api/admins/me/accounts/${account.id}`, {
  immediate: false
})
  .put(update)
  .json();

const updateWalletBalance = async () => {
  await execute();
  if (error.value || !data.value) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: error.value.message
    });
    return;
  }

  toast.add({
    severity: "success",
    summary: "Done",
    detail: "Account balance updated successfully",
    life: 3000
  });
  confirm.value = false;
  emit("update", update.value.walletBalance ?? 0);
  visible.value = false;
};

const disabled = computed(
  () =>
    isFetching.value ||
    update.value.walletBalance === account.walletBalance ||
    update.value.walletBalance === null ||
    update.value.walletBalance === undefined
);

const cancel = () => {
  confirm.value = false;
  update.value.walletBalance = account.walletBalance;
  visible.value = false;
};
</script>

<template>
  <div>
    <div @click="visible = true" class="cursor-pointer">
      <slot>
        <Button
          label="Edit"
          icon="pi pi-pencil"
          size="small"
          class="px-2 py-1 border-0 bg-white text-primary-500"
        />
      </slot>
    </div>

    <Dialog v-model:visible="visible" modal header="Edit Account Balance" class="max-w-96">
      <div>
        <div class="grid gap-4">
          <p>
            <span>Current Balance: </span>
            <span class="font-semibold text-primary-500">
              ${{ account.walletBalance.toLocaleString() }}
            </span>
          </p>
          <div class="grid">
            <label class="text-mute text-sm font-semibold">New Balance </label>
            <InputNumber v-model="update.walletBalance" :max-fraction-digits="2" fluid />
          </div>

          <Button v-if="!confirm" @click="confirm = true" :disabled label="Submit" fluid />

          <div v-else>
            <Divider />

            <p class="text-sm text-red-500 font-medium">Are you sure you want to proceed?</p>
            <div class="mt-2 grid grid-cols-2 gap-2">
              <Button
                @click="cancel"
                size="small"
                label="Cancel"
                icon="pi pi-times"
                severity="secondary"
              />
              <Button
                @click="updateWalletBalance"
                :loading="isFetching"
                :disabled
                size="small"
                label="Proceed"
                icon="pi pi-check"
                severity="danger"
              />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>
