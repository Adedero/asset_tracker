<script setup lang="ts">
import { ref } from "vue";
import { useConfirm, useToast } from "primevue";
import { useFetch } from "@/app/composables/use-fetch";

const { id } = defineProps<{
  id: string;
}>();

const emit = defineEmits<{
  delete: [id: string];
}>();

const toast = useToast();
const confirm = useConfirm();

const { isFetching, error, data, execute } = useFetch(() => `/api/admins/me/currencies/${id}`, {
  immediate: false
})
  .delete()
  .json();

const deleteCurrency = async () => {
  await execute();

  if (error.value || !data.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.value.message,
      life: 6000
    });

    return;
  }

  toast.add({
    severity: "success",
    summary: "Success",
    detail: "Currency deleted",
    life: 3000
  });
  emit("delete", id);
};

const confirmDelete = () => {
  confirm.require({
    message: "Are you sure you want to proceed?",
    header: "Delete Currency",
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
      deleteCurrency();
    }
  });
};
</script>

<template>
  <div>
    <slot>
      <Button
        @click="confirmDelete"
        :loading="isFetching"
        icon="pi pi-trash"
        severity="danger"
        size="small"
        rounded
        outlined
      />
    </slot>
  </div>
</template>
