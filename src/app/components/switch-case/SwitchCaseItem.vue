<script setup lang="ts">
import { computed, inject } from "vue";
import type { Ref } from "vue";

interface Props {
  value: string | number | boolean;
}
const props = defineProps<Props>();

const switchCase = inject<Ref<string | number | boolean>>("switch-case");

const isMatched = computed(() => props.value === switchCase?.value);
</script>

<template>
  <div v-if="isMatched">
    <slot />
  </div>
</template>
