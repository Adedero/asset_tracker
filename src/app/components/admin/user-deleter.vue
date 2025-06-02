<script setup lang="ts">
import { useConfirm, useToast } from "primevue";
import { useFetch } from "@/app/composables/use-fetch";

const { userId } = defineProps<{ userId: string }>();

const emit = defineEmits(["remove"]);

const toast = useToast();

const { isFetching, error, data, execute } = useFetch(`/api/admins/me/users/${userId}`, {
  immediate: false
})
  .delete()
  .json();

const deleteAccount = async () => {
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

  emit("remove");

  toast.add({
    severity: "success",
    summary: "Done",
    detail: "User account deleted",
    life: 3000
  });
};

const confirm = useConfirm();
const confirmDelete = () => {
  confirm.require({
    message:
      "Are you sure you want to delete this uers's account. " +
      "This will also delete their investment and transaction records, and cannot be undone.",
    header: "Delete Account",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Delete",
      severity: "danger"
    },
    accept: () => {
      deleteAccount();
    }
  });
};
</script>

<template>
  <div>
    <div @click="confirmDelete" class="cursor-pointer">
      <slot :loading="isFetching">
        <Button
          :loading="isFetching"
          label="Delete Account"
          icon="pi pi-chevron-right"
          icon-pos="right"
          size="small"
          fluid
          outlined
          severity="danger"
        />
      </slot>
    </div>
  </div>
</template>
