<script setup lang="ts">
import { TerminateInvestmentApiResponse } from "@/modules/admin/investments/investments-terminate.api";
import { useFetch } from "@/app/composables/use-fetch";
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

type TerminationRequest = {
  terminationReason: string;
  terminator: "ADMIN" | "USER";
  applyTerminationFee: boolean;
};

const request = ref<TerminationRequest>({
  terminationReason: "",
  terminator: "ADMIN",
  applyTerminationFee: true
});

const {
  isFetching,
  error,
  data,
  execute: terminate
} = useFetch(`/api/admins/me/investments/${investment.id}/terminate`, { immediate: false })
  .post(request)
  .json<TerminateInvestmentApiResponse>();

const terminateInvestment = async () => {
  if (!request.value.terminationReason) return;

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

  visible.value = false;
};

const confirm = useConfirm();

const confirmTermination = () => {
  confirm.require({
    message: "Are you sure you want to terminate this investment? ".concat(
      "This action cannot be reversed!"
    ),
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

const cancel = () => {
  request.value = {
    terminationReason: "",
    terminator: "ADMIN",
    applyTerminationFee: true
  };
  visible.value = false;
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
          <Textarea id="reason" v-model="request.terminationReason" rows="6" class="resize-none" />
        </div>

        <div class="mt-4 flex items-center gap-2 flex-wrap">
          <Checkbox binary v-model="request.applyTerminationFee" id="apply-fee" />
          <label for="apply-fee" class="text-sm text-mute font-medium">
            Apply ${{ investment.terminationFee.toLocaleString() }} termination fee
          </label>
        </div>

        <div class="mt-4 flex items-center gap-3 justify-end">
          <Button @click="cancel" label="Cancel" severity="secondary" />

          <Button
            severity="danger"
            label="Terminate investment"
            @click="terminateInvestment"
            :loading="isFetching"
            :disabled="isFetching || !request.terminationReason"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
