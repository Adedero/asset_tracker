<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "primevue";
import type { User } from "@/prisma-gen";
import { useFetch } from "@/app/composables/use-fetch";

const { user } = defineProps<{ user: User }>();

const toast = useToast();

const visible = ref<boolean>(false);

const credentials = ref({
  password: "00000000",
  notify: true
});

const { isFetching, error, data, execute } = useFetch(
  `/api/admins/me/users/${user.id}/reset-password`,
  {
    immediate: false
  }
)
  .put(credentials)
  .json();

const resetPassword = async () => {
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
    detail: "Password has been reset.",
    life: 3000
  });

  visible.value = false;
};
</script>

<template>
  <div>
    <div @click="visible = true" class="cursor-pointer">
      <slot :loading="isFetching">
        <Button
          :loading="isFetching"
          label="Reset Password"
          icon="pi pi-chevron-right"
          icon-pos="right"
          size="small"
          fluid
          outlined
        />
      </slot>
    </div>

    <Dialog v-model:visible="visible" modal header="Reset Password" class="max-w-96">
      <div class="grid gap-2">
        <Message v-if="isFetching" size="small">
          <p>Resetting password...</p>
        </Message>

        <p>Are you sure you want to reset {{ user ? user.name : "this user" }}'s password?</p>

        <div>
          <div class="flex items-center justify-between gap-2">
            <label class="text-sm font-medium text-mute">Notify user</label>
            <ToggleSwitch v-model="credentials.notify" :disabled="isFetching" size="small" />
          </div>
          <p class="text-xs text-mute">
            Send an email to {{ user ? user.name : "this user" }} notifying them their password has
            been reset.
          </p>
        </div>

        <div class="flex items-center gap-2 justify-end">
          <Button @click="visible = false" label="Cancel" severity="secondary" outlined />
          <Button @click="resetPassword" label="Proceed" :loading="isFetching" severity="danger" />
        </div>
      </div>
    </Dialog>
  </div>
</template>
