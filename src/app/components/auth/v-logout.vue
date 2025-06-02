<script setup lang="ts">
import useAuth from "@/app/composables/use-auth";
import { useConfirm } from "primevue/useconfirm";

const { logout } = useAuth();
const confirm = useConfirm();

const confirmAction = () => {
  confirm.require({
    header: "Log Out",
    message: "Are you sure you want to log out?",
    acceptLabel: "Log out",
    acceptIcon: "pi pi-sign-out",
    acceptProps: {
      iconPos: "right",
      severity: "danger",
      size: "small"
    },
    rejectLabel: "Cancel",
    rejectIcon: "pi pi-times",
    rejectProps: {
      severity: "secondary",
      size: "small"
    },
    accept() {
      logout();
    }
  });
};
</script>

<template>
  <button @click="confirmAction()" class="w-full">
    <slot>
      <Button label="Log Out" icon="pi pi-sign-out" icon-pos="right" />
    </slot>
  </button>
</template>
