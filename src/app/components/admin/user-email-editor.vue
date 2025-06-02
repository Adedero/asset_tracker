<script setup lang="ts">
import { useFetch } from "@/app/composables/use-fetch";
import type { User } from "@/prisma-gen";
import { useToast } from "primevue";
import { computed, ref } from "vue";
import { z } from "zod";

const { user } = defineProps<{
  user: User;
}>();

const emit = defineEmits<{
  update: [email: string, verified: boolean];
}>();

const toast = useToast();
const visible = ref<boolean>(false);
const confirm = ref<boolean>(false);

const credentials = ref({
  email: user.email,
  verified: false,
  notify: true
});

const { isFetching, error, data, execute } = useFetch(
  `/api/admins/me/users/${user.id}/change-email`,
  {
    immediate: false
  }
)
  .put(credentials)
  .json();

const update = async () => {
  confirm.value = false;

  const Schema = z.object({
    email: z.string({ message: "Email is required" }).email({ message: "Enter a valid email" })
  });

  const result = Schema.safeParse({ email: credentials.value.email });

  if (!result.success) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: result.error.errors[0].message,
      life: 6000
    });
    return;
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

  toast.add({
    severity: "success",
    summary: "Done",
    detail: data.value.message || "User email updated successfully",
    life: 3000
  });
  emit("update", credentials.value.email, credentials.value.verified);
  visible.value = false;
};

const disabled = computed(
  () => isFetching.value || !credentials.value.email || credentials.value.email === user.email
);

const cancel = () => {
  confirm.value = false;
  credentials.value = {
    email: user.email,
    verified: false,
    notify: true
  };
  visible.value = false;
};
</script>

<template>
  <div>
    <div @click="visible = true" class="cursor-pointer">
      <slot>
        <Button
          label="Change Email"
          icon="pi pi-chevron-right"
          icon-pos="right"
          size="small"
          fluid
          outlined
        />
      </slot>
    </div>

    <Dialog v-model:visible="visible" modal header="Edit Email Address" class="max-w-96">
      <div>
        <div class="grid gap-4">
          <p>
            <span>Current Email: </span>
            <span class="font-semibold text-primary-500">
              {{ user.email }}
            </span>
          </p>

          <div class="grid">
            <label class="text-mute text-sm font-semibold">New Email </label>
            <InputText v-model="credentials.email" fluid />
          </div>

          <div class="grid">
            <div class="flex flex-wrap items-center gap-2 justify-between">
              <label class="text-mute text-sm font-semibold">Mark email as verified </label>
              <ToggleSwitch v-model="credentials.verified" />
            </div>
            <small class="text-xs text-mute mt-1">
              If you mark this email as verified, the user can log in without an OTP verification
              message sent to the email to verify it.
            </small>
          </div>

          <div class="grid">
            <div class="flex flex-wrap items-center gap-2 justify-between">
              <label class="text-mute text-sm font-semibold">Notify user </label>
              <ToggleSwitch v-model="credentials.notify" />
            </div>
            <small class="text-xs text-mute mt-1">
              Send an email to {{ user ? user.name : "this user" }} notifying them their email has
              been changed.
            </small>
          </div>

          <Button
            v-if="!confirm"
            @click="confirm = true"
            :loading="isFetching"
            :disabled
            :label="isFetching ? 'Updating...' : 'Submit'"
            fluid
          />

          <div v-else>
            <Divider />
            <p class="text-sm text-red-500 font-medium">
              Are you sure you want to proceed? Please, make sure you have entered a valid email.
            </p>
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
