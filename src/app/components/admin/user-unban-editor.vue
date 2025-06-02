<script setup lang="ts">
import { computed, ref } from "vue";
import { useToast } from "primevue";
import { useFetch } from "@/app/composables/use-fetch";
import type { User } from "@/prisma-gen";

const { user } = defineProps<{ user: User }>();

const emit = defineEmits(["ban"]);

const toast = useToast();
const visible = ref<boolean>(false);
const confirm = ref<boolean>(false);

const credentials = ref<{ unfreezeInvestments: boolean }>({
  unfreezeInvestments: false
});

const { isFetching, error, data, execute } = useFetch(`/api/admins/me/users/${user.id}/unban`, {
  immediate: false
})
  .put(credentials)
  .json();

const update = async () => {
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
    detail: data.value.message,
    life: 3000
  });

  visible.value = false;
};

const cancel = () => {
  credentials.value = {
    unfreezeInvestments: true
  };
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
          label="Unban"
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
          <p>Are you sure you want to unban this user?</p>

          <div class="grid">
            <div class="flex flex-wrap items-center gap-2 justify-between">
              <label class="text-mute text-sm font-semibold">Unfreeze Investments</label>
              <ToggleSwitch v-model="credentials.unfreezeInvestments" />
            </div>
            <small class="text-xs text-mute mt-1">
              Unfreeze any of {{ user ? `${user.name}'s` : "this user's" }} investments that were
              frozen when they were banned.
            </small>
          </div>

          <Button
            v-if="!confirm"
            @click="confirm = true"
            :loading="isFetching"
            :label="isFetching ? 'Loading...' : 'Submit'"
            fluid
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
