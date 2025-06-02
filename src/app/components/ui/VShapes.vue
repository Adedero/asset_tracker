<script setup lang="ts">
import { twMerge } from "tailwind-merge";

interface Props {
  squareClass?: string;
  circleClass?: string;
  triangleClass?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
}

const { squareClass, circleClass, triangleClass, className, width, height } = defineProps<Props>();
</script>

<template>
  <div :class="twMerge('flex items-center gap-3 w-fit', className)">
    <div
      :style="{ width, height }"
      :class="
        twMerge(
          'r-square',
          'rounded-sm w-5 h-5 bg-rose-500/50 dark:bg-rose-500/70 spin-acw',
          squareClass
        )
      "
    ></div>

    <div
      :style="{ width, height }"
      :class="
        twMerge(
          'r-circle',
          'rounded-full w-5 h-5 bg-amber-500/50 dark:bg-amber-500/70',
          circleClass
        )
      "
    ></div>

    <div
      :style="{ width, height }"
      :class="
        twMerge('r-triangle', 'w-[24px] bg-blue-500/50 dark:bg-blue-500/70 spin-cw', triangleClass)
      "
    ></div>
  </div>
</template>
