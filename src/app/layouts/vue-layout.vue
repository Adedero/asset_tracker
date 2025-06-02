<!-- VueLayout.vue -->
<script setup lang="ts">
import { computed } from "vue";

import AuthLayout from "./auth-layout.vue";
import MainLayout from "./main-layout.vue";
import UserLayout from "./user-layout.vue";
import AdminLayout from "./admin-layout.vue";

// Define the prop
const props = defineProps<{ name: keyof typeof layoutMap }>();

// Map the layout name to the corresponding component
const layoutMap = {
  auth: AuthLayout,
  main: MainLayout,
  user: UserLayout,
  admin: AdminLayout
};

// Compute the selected layout component
const LayoutComponent = computed(() => layoutMap[props.name]);
</script>

<template>
  <component :is="LayoutComponent">
    <slot />
  </component>
</template>
