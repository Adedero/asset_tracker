<script setup lang="ts">
import { toTitleCase } from "@/app/utils/helpers";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const header = computed(() => {
  if (!route.name) {
    return "";
  }
  const name = route.name.toString();
  if (name.startsWith("admin")) {
    return name.slice(5);
  }
  if (name.startsWith("user")) {
    return name.slice(4);
  }
  return name;
});
</script>

<template>
  <div
    class="py-2 px-3 rounded-xl w-full bg-white dark:bg-slate-900 grid md:grid-cols-3 shadow-sm items-center"
  >
    <div>
      <slot name="left">
        <p class="cursor-context-menu text-lg font-semibold text-primary-500 dark:text-primary-400">
          {{ toTitleCase(header) }}
        </p>
      </slot>
    </div>

    <div class="flex items-center justify-center">
      <slot name="center"> </slot>
    </div>

    <div class="flex items-center justify-end">
      <slot name="right"> </slot>
    </div>
  </div>
</template>
