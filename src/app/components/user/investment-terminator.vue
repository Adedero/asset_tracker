<script setup lang="ts">
import { TerminateInvestmentApiResponse } from "@/modules/user/investments/investments-terminate.api";
import { useFetch } from "@/app/composables/use-fetch";
import { dollar } from "@/app/utils/helpers";
import { Investment } from "@/prisma-gen";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { ref } from "vue";

interface Props {
  investment: Investment;
}

interface Emits {
  terminate: [investment: Investment];
}

const { investment } = defineProps<Props>();
const emit = defineEmits<Emits>();

const toast = useToast();
const visible = ref(false);
const terminationReason = ref("");

const {
  isFetching,
  error,
  data,
  execute: terminate
} = useFetch(`/api/users/me/investments/${investment.id}/terminate`, { immediate: false })
  .post(() => ({ terminationReason: terminationReason.value }))
  .json<TerminateInvestmentApiResponse>();

const terminateInvestment = async () => {
  if (!terminationReason.value) return;
  visible.value = false;
  await terminate();

  if (error.value) {
    toast.add({
      severity: "error",
      summary: error.value.statusCode || error.value.name || "Error",
      detail: error.value.message
    });
    return;
  }

  if (!data.value?.success) return;

  emit("terminate", { ...investment, ...data.value.investment, investmentStatus: "TERMINATED" });
};

const confirm = useConfirm();

const confirmTermination = () => {
  confirm.require({
    message: `Are you sure you want to terminate this investment?
      This incurs a termination fee of ${dollar.format(investment.terminationFee)} and cannot be undone.`,
    header: "Termination of Investment",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Proceed",
      severity: "danger"
    },
    accept: () => {
      visible.value = true;
    }
  });
};
</script>

<template>
  <div class="w-full">
    <button class="cursor-pointer w-full" aria-label="terminate investment">
      <slot>
        <Button
          :loading="isFetching"
          @click="confirmTermination()"
          severity="danger"
          icon="pi pi-times-circle"
          label="Terminate"
          fluid
        />
      </slot>
    </button>

    <Dialog v-model:visible="visible" header="Terminate Investment" modal class="max-w-96">
      <div class="grid gap-5">
        <p>
          You are about to terminate your investment:
          <span class="font-semibold">{{ investment.investmentName }}</span>
          ({{ investment.investmentTier }} Tier)
        </p>
        <div class="grid gap-1">
          <label for="reason" class="text-sm text-mute font-medium">
            Enter the reason for terminating the investment
          </label>
          <Textarea id="reason" v-model="terminationReason" rows="6" class="resize-none" />
        </div>
        <Button
          severity="danger"
          label="Terminate investment"
          @click="terminateInvestment"
          :loading="isFetching"
          :disabled="isFetching || !terminationReason"
        />
      </div>
    </Dialog>
  </div>
</template>
