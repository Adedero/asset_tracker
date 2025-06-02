<script setup lang="ts">
import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { Investment, InvestmentStatus } from "@/prisma-gen";
import { useFetch } from "@/app/composables/use-fetch";

const { investment } = defineProps<{
  investment: Investment;
}>();

const emit = defineEmits<{
  toggle: [investment: Investment];
}>();

const toast = useToast();
const confirm = useConfirm();

const visible = ref<boolean>(false);

const confirmDialogHeader = computed(() => {
  return investment.investmentStatus === "OPEN" ? "Pause Investment" : "Resume Investment";
});

const disabled = computed(() => {
  if (investment.investmentStatus === "OPEN") {
    return !pausedReason.value;
  }
  return false;
});

const pausedReason = ref<string>("");

type Body = {
  investmentStatus: InvestmentStatus;
  pausedReason: string | null;
  pausedAt: Date | null;
  isPausing: boolean;
};
const body = ref<Body | null>(null);

const { isFetching, error, data, execute } = useFetch(
  `/api/admins/me/investments/${investment.id}`,
  {
    immediate: false
  }
)
  .put(body)
  .json();

async function toggleInvestmentPause() {
  body.value = null;

  if (investment.investmentStatus === "OPEN") {
    body.value = {
      investmentStatus: "PAUSED",
      pausedReason: pausedReason.value,
      pausedAt: new Date(),
      isPausing: true
    };
  } else {
    body.value = {
      investmentStatus: "OPEN",
      pausedReason: null,
      pausedAt: null,
      isPausing: false
    };
  }

  await execute();

  if (error.value || !data.value) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: error.value.message,
      life: 6000
    });

    return;
  }

  emit("toggle", {
    ...investment,
    investmentStatus: body.value.investmentStatus,
    pausedReason: body.value.pausedReason,
    pausedAt: body.value.pausedAt
  });

  toast.add({
    severity: "success",
    summary: "Done",
    detail:
      data.value.message ||
      `Investment ${investment.investmentStatus === "OPEN" ? "paused" : "resumed"}.`,
    life: 3000
  });

  cancel();
}

const confirmToggle = () => {
  if (investment.investmentStatus === "PAUSED") {
    toggleInvestmentPause();
    return;
  }
  confirm.require({
    header: "Confirm Investment Pause",
    message: "Are you sure you want to proceed?",
    rejectProps: {
      severity: "secondary",
      label: "Cancel"
    },
    acceptProps: {
      severity: "warn",
      label: "Pause"
    },
    reject: () => {
      cancel();
    },
    accept: () => {
      toggleInvestmentPause();
    }
  });
};

function cancel() {
  pausedReason.value = "";
  visible.value = false;
}
</script>

<template>
  <div>
    <div @click="visible = true" class="cursor-pointer">
      <slot>
        <Button
          :label="
            investment.investmentStatus === 'PAUSED' ? 'Resume Investment' : 'Pause Investment'
          "
          icon="pi pi-chevron-right"
          icon-pos="right"
          size="small"
          fluid
          :severity="investment.investmentStatus === 'PAUSED' ? '' : 'warn'"
        />
      </slot>
    </div>

    <div>
      <Dialog
        v-model:visible="visible"
        modal
        :header="confirmDialogHeader"
        class="w-80"
        @hide="cancel"
      >
        <div>
          <div v-if="investment.investmentStatus === 'OPEN'">
            <div class="grid gap-1">
              <label for="reason" class="text-sm text-mute font-medium">
                Reason for pausing this investment
                <span class="text-red-500">*</span>
              </label>
              <Textarea v-model.trim="pausedReason" fluid col="5" class="resize-none" id="reason" />
            </div>
          </div>

          <div v-else-if="investment.investmentStatus === 'PAUSED'">
            Are you sure you want to resume this investment?
          </div>

          <div class="mt-4 flex items-center gap-3 justify-end">
            <Button @click="cancel" label="Cancel" severity="secondary" />

            <Button
              :loading="isFetching"
              :disabled="isFetching || disabled"
              @click="confirmToggle"
              :label="investment.investmentStatus === 'PAUSED' ? 'Resume' : 'Continue'"
            />
          </div>
        </div>
      </Dialog>
    </div>
  </div>
</template>
