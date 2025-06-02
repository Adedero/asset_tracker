<script setup lang="ts">
import { computed } from "vue";

interface Props {
  allLoaded?: boolean;
  totalPages?: number;
  rows?: number;
  length?: number;
}

const { rows, allLoaded = false, totalPages } = defineProps<Props>();

// Two-way binding with v-model:page
const page = defineModel<number>("page", { default: 0 });

const emit = defineEmits<{
  (e: "next", value: number): void;
  (e: "prev", value: number): void;
}>();

const prev = () => {
  if (page.value === 0) return;
  page.value -= 1;
  emit("prev", page.value);
};

const next = () => {
  if (allLoaded || (totalPages !== undefined && page.value >= totalPages - 1)) return;
  page.value += 1;
  emit("next", page.value);
};
</script>

<template>
  <div class="w-full select-none">
    <div
      class="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg"
    >
      <Button
        aria-label="Previous Page"
        @click="prev"
        :disabled="page < 1"
        size="small"
        severity="secondary"
        rounded
        icon="pi pi-angle-left"
      />

      <div
        class="border border-slate-400 rounded-md flex p-1 items-center gap-2 flex-shrink-0 text-sm text-slate-500 dark:text-slate-200"
        aria-label="Current Page"
      >
        <div v-if="rows && length" class="text-center flex-shrink-0 py-1 px-2">
          <span class="font-medium">{{ page * rows + 1 }}</span>
          to
          <span class="font-medium">{{ Math.min((page + 1) * rows, length) }} </span>
        </div>

        <p class="border border-slate-400 text-center p-1 px-2 rounded-md dark:text-slate-400">
          page <span class="font-medium text-slate-600 dark:text-slate-200">{{ page + 1 }}</span>
        </p>
      </div>

      <Button
        aria-label="Next Page"
        @click="next"
        :disabled="allLoaded || (totalPages !== undefined && page >= totalPages - 1)"
        size="small"
        severity="secondary"
        rounded
        icon="pi pi-angle-right"
        icon-pos="right"
      />
    </div>

    <div v-if="allLoaded" class="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
      All data loaded
    </div>
  </div>
</template>
