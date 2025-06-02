<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";

const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>

<template>
  <Button
    size="small"
    outlined
    severity="secondary"
    @click="toggleDark()"
    :icon="isDark ? 'pi pi-moon' : 'pi pi-sun'"
  />
</template>
