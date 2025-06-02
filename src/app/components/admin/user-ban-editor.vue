<script setup lang="ts">
import { computed, ref } from "vue";
import { useToast } from "primevue";
import { useFetch } from "@/app/composables/use-fetch";
import type { User } from "@/prisma-gen";
import { DateCalculator } from "@/app/utils/date-calculator";

const { user } = defineProps<{ user: User }>();

const emit = defineEmits(["ban"]);

const toast = useToast();
const visible = ref<boolean>(false);
const confirm = ref<boolean>(false);
const banIndefinitely = ref<boolean>(false);
const duration = ref<{ number: number; frame: string }>({
  number: 30,
  frame: "days"
});

const disabled = computed(() => {
  if (banIndefinitely.value) {
    return !credentials.value.banReason;
  }
  return !credentials.value.banReason || !duration.value.number || !duration.value.frame;
});

const timeFrame = ref(["seconds", "minutes", "hours", "days", "weeks", "months", "years"]);

const credentials = ref<{
  banReason: string;
  banDuration: Date | null;
  freezeInvestments: boolean;
}>({
  banReason: "",
  banDuration: null,
  freezeInvestments: true
});

const { isFetching, error, data, execute } = useFetch(`/api/admins/me/users/${user.id}/ban`, {
  immediate: false
})
  .put(credentials)
  .json();

const update = async () => {
  if (banIndefinitely.value) {
    credentials.value.banDuration = null;
  } else {
    credentials.value.banDuration = DateCalculator.fromNow(
      duration.value.number,
      duration.value.frame
    );
  }

  await execute();

  if (error.value || !data.value) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: error.value.message
    });
    return;
  }

  emit("ban");

  toast.add({
    severity: "success",
    summary: "Done",
    detail: data.value.message || "User banned successfully",
    life: 3000
  });

  visible.value = false;
};

const cancel = () => {
  credentials.value = {
    banReason: "",
    banDuration: null,
    freezeInvestments: true
  };
  duration.value = {
    number: 30,
    frame: "days"
  };
  banIndefinitely.value = false;
  confirm.value = false;
  visible.value = false;
};
</script>

<template>
  <div>
    <div @click="visible = true" class="cursor-pointer">
      <slot :loading="isFetching">
        <Button
          :loading="isFetching"
          label="Ban"
          icon="pi pi-chevron-right"
          icon-pos="right"
          size="small"
          fluid
          outlined
          severity="warn"
        />
      </slot>
    </div>

    <Dialog v-model:visible="visible" modal header="Ban User" class="max-w-96">
      <div>
        <div class="grid gap-4">
          <p>Are you sure you want to ban this user?</p>

          <div class="grid">
            <label class="text-mute text-sm font-semibold">Enter the reason for the ban</label>
            <Textarea v-model="credentials.banReason" rows="3" class="resize-none" />
          </div>

          <div class="grid">
            <div>
              <label class="text-mute text-sm font-semibold">Ban duration </label>

              <div class="flex items-center gap-2 justify-between">
                <InputNumber
                  v-model="duration.number"
                  :max-fraction-digits="2"
                  size="small"
                  fluid
                  :disabled="banIndefinitely"
                />
                <Select
                  v-model="duration.frame"
                  :options="timeFrame"
                  size="small"
                  fluid
                  :disabled="banIndefinitely"
                />
              </div>

              <div class="flex items-center gap-1 mt-2">
                <Checkbox v-model="banIndefinitely" binary />
                <span class="text-red-500 text-sm font-medium">Ban indefinetly</span>
              </div>
            </div>
          </div>

          <div class="grid">
            <div class="flex flex-wrap items-center gap-2 justify-between">
              <label class="text-mute text-sm font-semibold">Freeze Investments</label>
              <ToggleSwitch v-model="credentials.freezeInvestments" />
            </div>
            <small class="text-xs text-mute mt-1">
              Stop {{ user ? `${user.name}'s` : "this user's" }} investments from receiving any
              profits for the duration of their ban.
            </small>
          </div>

          <Button
            v-if="!confirm"
            @click="confirm = true"
            :loading="isFetching"
            :label="isFetching ? 'Loading...' : 'Submit'"
            fluid
            :disabled
          />

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
                @click="update"
                :loading="isFetching"
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
