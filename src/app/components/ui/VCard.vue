<script setup lang="ts">
import { ref } from "vue";
import { twMerge } from "tailwind-merge";
import { Icon } from "@iconify/vue";

interface Props {
  class?: string;
  headerClass?: string;
  header?: string;
  icon?: string;
  prime?: boolean;
  iconSize?: string | number;
  bgImage?: string;
}

const {
  class: className,
  headerClass,
  header,
  icon,
  iconSize = "18",
  prime,
  bgImage
} = defineProps<Props>();

const containerClass = ref(`bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 `);
</script>

<template>
  <div :class="twMerge('bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4', className)">
    <slot name="header">
      <div v-if="header || icon" class="pb-2 flex items-center gap-2 text-mute">
        <span
          v-if="icon && prime"
          :class="icon"
          :style="`width: ${iconSize}; height: ${iconSize}`"
        />
        <Icon v-if="icon && !prime" :icon :style="`width: ${iconSize}; height: ${iconSize}`" />
        <h1 v-if="header" :class="twMerge('font-semibold', headerClass)">
          {{ header }}
        </h1>
      </div>
    </slot>

    <slot />
  </div>
</template>
