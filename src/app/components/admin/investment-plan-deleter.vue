<script setup lang="ts">
import { useConfirm, useToast } from "primevue";
import { useFetch } from "@/app/composables/use-fetch";

const { id } = defineProps<{
  id: string;
}>();

const emit = defineEmits<{
  delete: [id: string];
}>();

const toast = useToast();

const { isFetching, error, data, execute } = useFetch(`/api/admins/me/investment-plans/${id}`, {
  immediate: false
})
  .delete()
  .json();

const deletePlan = async () => {
  await execute();

  if (error.value || !data.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.value.message
    });

    return;
  }

  toast.add({
    severity: "success",
    summary: "Success",
    detail: "Investment plan deleted",
    life: 3000
  });
  emit("delete", id);
};

const confirm = useConfirm();

const confirmDelete = () => {
  confirm.require({
    message: "Are you sure you want to proceed?",
    header: "Delete Investment Plan",
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
      deletePlan();
    }
  });
};
</script>

<template>
  <div>
    <div @click="confirmDelete()">
      <slot :loading="isFetching">
        <Button
          label="Delete"
          :loading="isFetching"
          size="small"
          icon="pi pi-trash"
          severity="danger"
          fluid
          outlined
        />
      </slot>
    </div>
  </div>
</template>
